# From 1,993 To 17,007 Requests Per Second: How I Optimized A Node.js + MongoDB Backend At Scale

## Introduction

OpenCanvas is a platform built to bridge the gap between ResearchGate and Reddit, giving college researchers and writers a place to publish, discover, and discuss work that would otherwise never surface. Behind it sits a standard Express and MongoDB stack, nothing exotic. What made this a meaningful engineering exercise was the constraint: the database was seeded with 400,000 users, 100,000 posts, 500,000 interactions, 100,000 follows, and 320,000 comments, and the goal was to squeeze every last request per second out of a single Node.js process before reaching for additional infrastructure.

The result was a journey from 1,993 RPS to 6,138 RPS on a single thread, and then to 17,007 RPS in cluster mode, all measured under aggressive autocannon stress tests against a live MongoDB-backed feed route. This article documents every decision that drove that improvement, with the actual code, the reasoning, and the numbers.

> GitHub Link of the codes provided: https://github.com/Dream-World-Coder/opencanvas/tree/main/server/src

---

## The Baseline: What I Was Working With

Before any optimization, the primary bottleneck was the `/articles` feed route. Every request was doing the following:

1. Running a `find` query with a `skip` offset for pagination
2. Populating the author's data on every post document using Mongoose's `.populate()`
3. Returning the full post `content` field, which for article-type posts could be tens of kilobytes of Markdown
4. No caching whatsoever

Under a simple autocannon test with 100 connections:
```txt
    Requests per second: 1,993
    Average Latency: 49ms
```

Under a stressed test with 500 connections and 10 pipelining:
```txt
    Requests per second: 2,504
    Average Latency: 1,609ms
```

Those numbers with 100,000 posts and half a million interactions in the database meant the platform would fall over under any meaningful traffic. The fixes were architectural, not superficial.

---

## Optimization 1: Denormalization and the authorSnapshot Pattern

The most expensive operation in the original feed query was the `.populate()` call. Every time a list of posts was fetched, Mongoose would issue a separate query to the `users` collection for each unique `authorId` in the result set. At 10 posts per page, that is up to 10 additional round trips to MongoDB before the response could be sent.

The fix was to embed a snapshot of the author's display data directly inside the Post document at write time.

```js
// Post.js (schema)
authorSnapshot: {
  username: { type: String, required: true },
  profilePicture: { type: String },
  fullName: String,
},
```

This `authorSnapshot` is written when a post is created or updated, always kept current, and never populated on read. The feed query now fetches everything it needs in a single collection scan. There is a known trade-off: <u>if a user changes their username or profile picture, older posts will briefly show stale snapshot data until they next save a post.</u> For a content platform, this is an entirely acceptable consistency model.

```js
// post.js (route) - snapshot is always refreshed on save
authorSnapshot: {
  username: req.user.username,
  profilePicture: req.user.profilePicture,
  fullName: req.user.fullName,
},
```

The same pattern is used for comments. Rather than populating `authorId` on every comment fetch, the `authorSnapshot` with `username` and `profilePicture` is embedded at comment creation time. At 320,000 comments in the database, the savings are significant.

---

## Optimization 2: contentPreview and Payload Reduction

The original feed was returning the full `content` field of every post. A research article might be 8,000 to 15,000 characters of Markdown. Returning that for 10 posts per page, across potentially thousands of concurrent users, is an enormous waste of bandwidth and serialization time.

The solution was a dedicated `contentPreview` field, populated at write time with the first 700 characters of the content.

```js
// Post.js (schema)
contentPreview: {
  type: String,
  default: "",
  maxlength: 700,
},
```

```js
// post.js (route) - sliced on save, not on read
contentPreview: content?.slice(0, 700) ?? "",
```

The feed query then selects only `contentPreview`, never `content`. The full content field is only fetched on the individual post page route. <u>This single change reduced per-response payload size by roughly 95 percent for article-type posts,</u> which directly translates to higher RPS and lower average latency.

The field selection in the feed route is explicit and tight:

```js
// feed.js 
.select(
  "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats createdAt updatedAt",
)
```

The `content` field is never included. Every byte not sent is a byte the event loop does not have to serialize.

---

## Optimization 3: Eliminating .populate() with .lean()

Mongoose documents returned from a query are <u>full class instances.</u> They carry prototype methods, virtual fields, getter and setter logic, and change-tracking overhead. For read-only endpoints, all of that is pure waste.

The `.lean()` modifier tells Mongoose to return plain JavaScript objects instead of Mongoose document instances, bypassing all of that overhead.

```js
// feed.js 
const posts = await Post.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .select(
        "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats createdAt updatedAt",
      )
      .lean();
```

I used it in other read only parts also. like `updateEngagementScore.js` and `search.js`

The performance gain from `.lean()` is especially meaningful on high-throughput routes where the same query runs thousands of times per minute. Combined with the removal of `.populate()` via denormalization, the per-query CPU cost drops substantially.

---

## Optimization 4: Cursor-Based Pagination vs skip()

The `skip()` approach to pagination is one of the most common performance mistakes in MongoDB applications. When you write `.skip(500).limit(10)`, MongoDB still has to scan through 500 documents before discarding them and returning the next 10. So, for example, a user on page 50 causes MongoDB to scan 500 documents every time. Under concurrent load, this degrades quadratically.

Cursor based pagination <u>replaces the offset with a positional bookmark.</u> The client sends the position of the last seen item, and the server queries for documents that come after that position. MongoDB can use an index to jump directly to the right location.

The feed cursor is encoded as a base64 JSON object containing `createdAt` and `_id` of the last document seen:

```js
// feed.js 
nextCursor = Buffer.from(
  JSON.stringify({
    createdAt: last.createdAt.toISOString(),
    lastId: last._id.toString(),
  }),
).toString("base64");
```

On the next request, the server decodes this cursor and constructs a range query:

```js
// feed.js 
query.$or = [
  { createdAt: { $lt: cursorDate } },
  { createdAt: cursorDate, _id: { $lt: cursorId } },
];
```

The tie-break on `_id` handles the edge case where two posts have identical `createdAt` timestamps, which can happen in test environments with seeded data or under very high write concurrency. This compound condition maps directly onto the compound index defined in the schema:

```js
// Post.js 
postSchema.index({ isPublic: 1, createdAt: -1, _id: -1 });
```

MongoDB can satisfy this query with a single index scan, no collection scan, no document discard. The cost of fetching page 1 and page 5,000 is identical.

The `skip()` approach is still used on lower traffic routes like paginated comments, follower lists, and collection browsers where the dataset per user is bounded and the trade-off in code simplicity is justified.

---

## Optimization 5: Proper Indexing Strategy

Indexes are the single highest-leverage optimization in any database-backed application. <u>The wrong indexes will slow writes without helping reads. The right indexes turn expensive collection scans into fast index scans.</u>

The Post collection carries three compound indexes, each targeting a specific query pattern:

```js
// Post.js 
postSchema.index({ authorId: 1, isPublic: 1, createdAt: -1 }); // profile page posts
postSchema.index({ isPublic: 1, createdAt: -1, _id: -1 });  // articles feed
postSchema.index({ tags: 1, isPublic: 1 });  // topic search
```

The field order within a compound index matters. The feed query always filters by `isPublic: true` first, then sorts by `createdAt` descending. Placing `isPublic` first in the index allows MongoDB to immediately narrow to the public subset before doing any range scan. <u>If the order were reversed, the index would be far less useful.</u>

The Follow and Interaction collections both carry unique compound indexes that serve double duty: they enforce data integrity (no duplication) and provide fast lookup paths for the most common read patterns.

```js
// Follow.js
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Interaction.js
interactionSchema.index({ userId: 1, targetId: 1, type: 1 }, { unique: true });
interactionSchema.index({ targetId: 1, type: 1 });
```

The second index on Interaction (`targetId + type`) allows efficient queries like "how many likes does this post have" without scanning the entire interactions collection for a specific user.

---

## Optimization 6: Atomic Counters and Denormalized Stats

A naive implementation of a likes counter would count matching Interaction documents every time the stat is needed:

```js
// what not to do on every feed request
const likeCount = await Interaction.countDocuments(
  { targetId: postId, type: "like" }
 );
```

At 500,000 interactions in the database, this is unacceptably expensive for a field displayed on every post card in the feed.

The solution is to maintain denormalized counters on the parent document and update them atomically using MongoDB's `$inc` operator. The counter update happens at write time (when a like or dislike action occurs), so read time requires no computation at all.

```js
// post.js (like route)
await Post.findByIdAndUpdate(postId, { $inc: { [statField]: 1 } });
```

The same pattern governs follow counts on the User document:

```js
// follow.js
await User.findByIdAndUpdate(req.userId, {
  $inc: { "stats.followingCount": 1 },
});
await User.findByIdAndUpdate(targetUserId, {
  $inc: { "stats.followersCount": 1 },
});
```

These <u>`$inc` operations are atomic in MongoDB</u>, meaning concurrent requests cannot produce a race condition that results in an incorrect count. The Interaction collection remains the source of truth for deduplication (enforced by the unique index), while the counters on User and Post exist purely to serve read performance.

---

## Optimization 7: In-Memory TTL Cache with Intelligent Invalidation

The `/articles` feed is the most read route on the platform. Under the Artillery load test configuration, 70 percent of all simulated traffic targeted this single endpoint. Sending every one of those requests to MongoDB would be wasteful given that the feed content changes slowly, not on every request.

The cache implementation is a simple but well designed in-memory TTL store backed by a JavaScript `Map`:

```js
// cacheService.js
class CacheService {
  constructor() {
    this.store = new Map();
    setInterval(() => this._evictExpired(), 2 * 60 * 1000).unref();
  }

  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key); // lazy eviction on read
      return null;
    }
    return entry.value;
  }
```

Two TTL values govern the two cached routes:

```js
// cacheService.js 
const TTL = {
  ARTICLES_FEED: 30,  // 30 seconds
  TOP_WRITERS: 5 * 60,   // 5 minutes
};
```

The 30-second TTL on the articles feed is intentionally short. It is long enough that a viral traffic spike serves hundreds of cache hits per second without touching the database, but short enough that new posts appear within half a minute.

Cache keys are constructed to account for pagination state and limit variations:

```js
// feed.js 
const cacheKey = `articles:c${rawCursor}:l${limit}`;
```

This means `articles:c:l10`, `articles:cABC123:l10`, and `articles:c:l25` are all separate cache entries. The Artillery load test exploited this deliberately, with 30 percent of traffic using randomized limit values to generate cache misses and force DB hits, simulating worst-case conditions.

The cache also supports prefix-based invalidation. When a post is created, deleted, or toggled between public and private, the entire articles feed cache is invalidated:

```js
// post.js
cache.invalidatePrefix("articles:");
```

This uses a simple iteration over the Map's keys, deleting any entry whose key starts with the given prefix. It is $O(n)$ over the number of cached keys, but with a 30 second TTL the cache rarely holds more than a few dozen entries, making this cost negligible.

The top writers route uses a single named key with a 5-minute TTL:

```js
// user.js 
const CACHE_KEY = "writers:top";
const cached = cache.get(CACHE_KEY);
if (cached) {
  return res.status(200).json(
    {
      success: true,
      data: cached,
      fromCache: true
    });
}
```

This key is deleted by name whenever a like or post creation/deletion event changes the underlying ranking data, ensuring correctness without waiting for TTL expiry.

---

## Optimization 8: Aggregation Pipeline for Ranked Queries

> Note: This is optimal but not related to the high RPS gain on `/articles`.

The top writers feature computes a `likesPerPost` ratio across all users and returns the top five. Doing this in application code would require loading all users with at least one post into memory, computing the ratio for each, sorting them, and slicing the result. In JavaScript, on a 400,000-user dataset, that would be both memory intensive and slow.

MongoDB's aggregation pipeline does this entirely inside the database engine, returning only the five documents the application actually needs:

```js
// user.js 
const topWriters = await User.aggregate([
  { $match: { "stats.postsCount": { $gt: 0 } } },
  {
    $addFields: {
      likesPerPost: {
        $divide: ["$stats.likesReceivedCount", "$stats.postsCount"],
      },
    },
  },
  { $sort: { likesPerPost: -1 } },
  { $limit: 5 },
  {
    $project: {
      _id: 1, username: 1, fullName: 1,
      profilePicture: 1, designation: 1,
      stats: 1, likesPerPost: 1,
    },
  },
]);
```

The `$match` stage filters out users with no posts before the sort, dramatically reducing the working set. The `$addFields` stage computes the virtual `likesPerPost` field server-side. The `$project` stage trims the output to only what the frontend needs. Combined with the 5-minute cache on the result, this expensive aggregation runs at most once every five minutes regardless of traffic.

---

## Optimization 9: Streaming Cursor for Batch Jobs

> Note: This is optimal but not related to the high RPS gain on `/articles`.

The engagement score recalculation job runs every 15 minutes via cron and must update all 100,000 posts. The naive approach would load all 100,000 documents into memory at once:

```js
// what not to do
const posts = await Post.find({}).lean();
// posts is now 100k objects in RAM
```

Instead, a streaming cursor is used to process documents one at a time, batching writes into groups of 1,000 for efficiency:

```js
// updateEngagementScore.js 
const cursor = Post.find({})
  .select("_id stats createdAt updatedAt")
  .lean()
  .cursor();
```

The `.cursor()` call returns an async iterable that fetches documents from MongoDB in batches internally, keeping memory usage constant regardless of collection size. The `.lean()` combined with tight field selection via `.select()` means each document in memory is a minimal plain object, not a full Mongoose instance.

Writes are batched and dispatched using `bulkWrite` with `ordered: false`, which allows MongoDB to execute the updates in parallel and continue past any individual failure rather than aborting the batch:

```js
// updateEngagementScore.js 
if (bulkOps.length >= BATCH_SIZE) {
  await Post.bulkWrite(bulkOps, { ordered: false });
  updatedCount += bulkOps.length;
  bulkOps = [];
}
```

This processes 100,000 posts in 100 round trips to MongoDB instead of 100,000 individual updates.

---

## Scalable Schema Design

Performance is not only about query optimization. The schema design itself determines how well the system handles growth and viral events.

Social graph data lives in a dedicated `Follow` collection rather than as an embedded array on the User document. A user with 50,000 followers would create an enormous User document if followers were embedded, making every User read slow. The separate collection keeps User documents small and follow lookups indexed.

```js
// Follow.js
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
```

Similarly, all engagement actions (likes, dislikes, saves) live in a single polymorphic `Interaction` collection rather than per-type arrays on their target documents. A post that goes viral might receive 100,000 likes. Storing those as an embedded array would make the Post document unmanageable. The Interaction collection scales independently, and the unique compound index prevents duplicate votes at the database level, not just the application level.

```js
// Interaction.js
interactionSchema.index({ userId: 1, targetId: 1, type: 1 }, { unique: true });
```

URL design also reflects scalability thinking. Post URLs follow the format `/p/<title-slug>-<24-char-objectid>`. The ObjectId is always the last segment and is the actual lookup key. The slug portion is cosmetic. This means the title can change without breaking links and the database lookup is always an O(1) ObjectId match:

```js
// post.js
const extractPostId = (slug) => {
  const parts = slug.split("-");
  const last = parts[parts.length - 1];
  return /^[a-f0-9]{24}$/i.test(last) ? last : null;
};
```

---

## The Results

After applying all of the above, the numbers under autocannon stress tests:

Condition | Pre-Optimization | Post-Optimization (Single Thread)
-- | - | -
Simple (100 conn)  | 1,993 RPS| 6,138 RPS  (avg latency 15ms)
Stressed (500x10)| 2,504 RPS| 6,679 RPS  (avg latency 353ms)

The Artillery real-world simulation ran three phases totaling 8,600 virtual user requests: a 30-second warm-up at 10 req/sec, a 60-second ramp from 10 to 100 req/sec, and a 10-second viral spike at 500 req/sec.

metric | value
-- | -
Total requests|8,600
HTTP 200 responses|8,600
Failures|0
Overall median|1ms
p95|1ms
p99|2ms
Absolute max latency|18ms (cold cache, first window only)

The 18ms maximum in the entire test occurred in the very first window, when the cache was cold and the first request hit MongoDB directly. After that, the worst response across the entire 102-second test, including the 500 req/sec spike, was 5ms.

---

## Cluster Mode: The Multiplier

Node.js runs on a single thread. No matter how well the application code is optimized, a single process is bounded by one CPU core. The Node.js `cluster` module solves this by forking one worker process per CPU core, all listening on the same port, with the OS kernel distributing incoming connections across them.

```js
// index.js
const NUM_WORKERS = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork(); // auto-restart on crash
  });

  cron.schedule("*/15 * * * *", () => {
    updateEngagementScore(); // cron runs only in primary
  });
} else {
  require("./server"); // workers just run express
}
```

The cron job runs only in the primary process to avoid N simultaneous engagement score recalculations. Each worker maintains its own MongoDB connection pool, which MongoDB Atlas handles without issue.

Cluster results under the same autocannon tests:

Condition | Single Thread | Cluster Mode
-- | - | -
Simple (100 conn)| 6,138 RPS| 15,913 RPS  (avg latency 5ms)
Stressed (500x10)| 6,679 RPS| 17,007 RPS  (avg latency 209ms)

The more meaningful number is the error rate: <u>under the stressed test, single thread produced 1,000 timeouts. Cluster mode under identical conditions produced 70</u>. That is a <u>14x reduction in failures</u>, which is what matters in production.

One important caveat: the in-memory cache in `cacheService.js` is per-process. <u>Each worker has its own independent cache</u>. Under cluster mode, the first request on each worker will be a cache miss even if another worker has already cached the result. With 8 cores, you could theoretically have 8 simultaneous cold cache DB hits for the same cache key. This is not a correctness problem, but it does reduce cache efficiency compared to a shared external cache. This is the primary reason Redis becomes compelling at scale, which is discussed next.

---

## What Comes Next: Fastify, Redis, and Nginx

The current architecture is Express, Node.js cluster, MongoDB, and an in-memory cache. This is solid for early production but has well understood ceilings.

**Fastify** is a drop in replacement for Express with a significantly faster HTTP layer. It uses a radix tree router instead of a linear scan, serializes JSON responses via compiled schemas instead of `JSON.stringify`, and has lower per-request overhead across the board. Benchmarks consistently show Fastify handling 30 to 50 percent more requests per second than Express on identical hardware for equivalent workloads. Migrating to Fastify would require porting route and middleware definitions but would not change any MongoDB or business logic.

**Redis** <u>solves the per process cache problem</u>. Moving the `cacheService` from an in-memory Map to Redis means all workers share a single cache. A cache miss on worker 3 populates an entry that worker 7 will then hit. This also unlocks persistence across restarts, distributed invalidation across multiple server instances, and access to Redis data structures like sorted sets, which could power the engagement score ranking query directly instead of running it as a cron job.

**Nginx** sits in front of Node.js and handles concerns that Node.js is not well-suited for: <u>TLS termination, static file serving, connection rate limiting, request buffering, and load balancing across multiple server instances</u>. Offloading TLS termination to Nginx alone reduces CPU load on Node.js meaningfully under HTTPS traffic.

The target architecture looks like this:

```txt
                         CLIENT
                           |
                           | HTTPS
                           v
              +------------------------+
              |         NGINX          |
              |  TLS termination       |
              |  Static file serving   |
              |  Rate limiting         |
              |  Load balancing        |
              +------------------------+
                    |           |
               HTTP/1.1    HTTP/1.1
                    |           |
         +----------+           +----------+
         |  Server Instance 1   |  Server Instance 2   (horizontal scaling)
         |                      |
         |  +----------------+  |  +----------------+
         |  | Node Cluster   |  |  | Node Cluster   |
         |  |                |  |  |                |
         |  | W1  W2  W3 W4  |  |  | W1  W2  W3 W4  |
         |  | (Fastify)      |  |  | (Fastify)      |
         |  +----------------+  |  +----------------+
         |         |            |         |
         +---------+------------+---------+
                         |
          +--------------+--------------+
          |                             |
    +----------+                  +----------+
    |  REDIS   |                  | MongoDB  |
    |          |                  | (Atlas   |
    | Shared   |                  |  Replica |
    | Cache    |                  |  Set)    |
    | Pub/Sub  |                  |          |
    | Sessions |                  | Primary  |
    +----------+                  | Secondary|
                                  | Secondary|
                                  +----------+
```

In this architecture, Nginx terminates all SSL connections and distributes traffic across multiple server instances. Each instance runs a Node.js cluster with Fastify workers. All workers on all instances share a single Redis instance for caching, session data, and pub/sub notifications. MongoDB runs as a replica set, enabling read scaling by routing read queries to secondary nodes while writes go to the primary.

The path from the current setup to this architecture is incremental. Redis can be introduced first by replacing the `CacheService` class with a Redis-backed equivalent without changing any route code. Nginx can be added as a reverse proxy with minimal configuration. Fastify migration can happen route by route. None of these changes require schema redesign or data migration.

---

## Conclusion

The optimization journey on OpenCanvas demonstrates that the most impactful performance improvements come from rethinking data shape and query patterns rather than from infrastructure changes. Removing `.populate()` through denormalization, reducing payload size through field selection and content previews, eliminating skip based pagination with cursor queries, and adding a small in-memory cache together produced a 3x improvement in RPS and a 100x improvement in tail latency on the most trafficked route.

The database scale, 400,000 users, 100,000 posts, and over a million secondary documents, was not a liability. It was the condition under which these optimizations were proven. A single Node.js thread, with no special hardware, handled 8,600 concurrent user requests spanning a warm-up, a ramp-up, and a 500 req/sec viral spike with zero failures and a p99 latency of 2 milliseconds.

This is the ceiling of what application level optimiation can achieve. The architecture described in the final section is what pushes the ceiling higher without changing a line of business logic.
