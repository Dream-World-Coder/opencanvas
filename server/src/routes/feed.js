const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const { cache, TTL } = require("../services/cacheService");

/**
 * LEGACY
 *
 * POST /articles/anonymous-user
 * Cursor-based feed sorted by anonymousEngagementScore.
 * Not cached — every request carries a unique cursor value.
 */
router.post("/articles/anonymous-user", async (req, res) => {
  try {
    const { cursor, limit = 16 } = req.body;

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit. Must be between 1 and 50.",
      });
    }

    const query = { isPublic: true };

    if (cursor) {
      try {
        const cursorData = JSON.parse(
          Buffer.from(cursor, "base64").toString("utf-8"),
        );

        // Use $or so that ties on score are broken deterministically by _id
        if (cursorData.lastId) {
          query.$or = [
            { anonymousEngagementScore: { $lt: cursorData.score } },
            {
              anonymousEngagementScore: cursorData.score,
              _id: { $lt: new mongoose.Types.ObjectId(cursorData.lastId) },
            },
          ];
        } else {
          query.anonymousEngagementScore = { $lt: cursorData.score };
        }
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cursor format" });
      }
    }

    const posts = await Post.find(query)
      .select(
        "title contentPreview slug type tags readTime thumbnailUrl isPremium authorSnapshot stats anonymousEngagementScore createdAt",
      )
      .sort({ anonymousEngagementScore: -1, _id: -1 })
      .limit(limit + 1) // one extra to determine if a next page exists
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    let nextCursor = null;
    if (hasMore && posts.length > 0) {
      const last = posts[posts.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          score: last.anonymousEngagementScore,
          lastId: last._id.toString(),
        }),
      ).toString("base64");
    }

    return res.status(200).json({ success: true, posts, hasMore, nextCursor });
  } catch (err) {
    console.error("Anonymous feed error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate feed.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/**
 * GET /articles?cursor=<base64>&limit=10
 *
 * Cursor-based public feed, sorted newest-first.
 * Replaces skip() — skip walks the index from the start on every request,
 * which gets progressively slower as the collection grows.
 * A cursor filter lets MongoDB seek directly to the right position.
 *
 * Cursor encodes: { createdAt: <ISO string>, lastId: <ObjectId string> }
 *   - createdAt  → primary sort key
 *   - lastId     → tie-breaker when two posts share the exact same createdAt
 *
 * The existing index { isPublic: 1, createdAt: -1 } covers this query fully.
 *
 * Cache key : "articles:c{cursor}:l{limit}"  (first page key is "articles:c:l{limit}")
 * TTL       : TTL.ARTICLES_FEED (30 seconds)
 * Busted by : post create, delete, or visibility toggle — see post.js
 *
 * Response shape:
 *   { success, results, data, nextCursor, hasMore }
 */
router.get("/articles", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const rawCursor = req.query.cursor || "";
    const cacheKey = `articles:c${rawCursor}:l${limit}`;

    // ::::: Cache hit :::::
    const cached = cache.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, ...cached, fromCache: true });
    }

    // ::::: Build query from cursor :::::
    const query = { isPublic: true };

    if (rawCursor) {
      let cursorData;
      try {
        cursorData = JSON.parse(
          Buffer.from(rawCursor, "base64").toString("utf-8"),
        );
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid cursor format" });
      }

      const cursorDate = new Date(cursorData.createdAt);
      const cursorId = new mongoose.Types.ObjectId(cursorData.lastId);

      // Fetch posts older than the cursor, breaking ties with _id
      query.$or = [
        { createdAt: { $lt: cursorDate } },
        { createdAt: cursorDate, _id: { $lt: cursorId } },
      ];
    }

    // ::::: Cache miss — hit the DB :::::
    // Fetch one extra to know whether a next page exists
    const posts = await Post.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .select(
        "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats createdAt updatedAt",
      )
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    // Encode the last post's position as the next cursor
    let nextCursor = null;
    if (hasMore && posts.length > 0) {
      const last = posts[posts.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: last.createdAt.toISOString(),
          lastId: last._id.toString(),
        }),
      ).toString("base64");
    }

    const payload = { results: posts.length, data: posts, nextCursor, hasMore };

    cache.set(cacheKey, payload, TTL.ARTICLES_FEED);

    return res.status(200).json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = { router };
