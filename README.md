# OpenCanvas

OpenCanvas is a full-stack publishing platform where writers, researchers, and thinkers can create and share long-form written content. It supports rich-text and Markdown authoring, post collections, follower/following social graphs, and a scored public feed for content discovery.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Database Models](#database-models)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Posts](#posts)
  - [Comments](#comments)
  - [Collections](#collections)
  - [Feed](#feed)
  - [Follow](#follow)
- [Authentication Flow](#authentication-flow)
- [Access Control](#access-control)
- [Engagement Scoring](#engagement-scoring)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)

---

## Project Structure

```txt
opencanvas/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Route-level page components
│       ├── components/      # Shared UI components
│       ├── contexts/        # React context providers (Auth, Theme, etc.)
│       ├── services/        # API call helpers (dataService.js, etc.)
│       └── hooks/           # Custom React hooks
└── server/                  # Express backend
    └── src/
        ├── models/          # Mongoose schemas
        ├── routes/          # Express route handlers
        ├── middlewares/     # Auth, error handling, fingerprinting
        ├── services/        # Image upload, notifications
        ├── jobs/            # Cron job logic
        └── utils/           # Helpers and validators
```

---

## Technology Stack

**Frontend**

- React 18 with Vite
- React Router v6
- TailwindCSS
- shadcn/ui component library
- TanStack Query for server state
- Axios for HTTP requests
- Sonner for toast notifications

**Backend**

- Node.js with Express
- MongoDB with Mongoose
- Passport.js (Google OAuth 2.0 strategy)
- JSON Web Tokens for stateless authentication
- node-cron for scheduled jobs
- Helmet for HTTP security headers
- Morgan for request logging

---

## Architecture Overview

The backend is a stateless REST API. Authentication is handled entirely through JWTs - no server-side sessions are used. Passport is only involved in the Google OAuth redirect flow; once a token is issued it is verified on every subsequent request by the `authenticateToken` middleware.

Two middleware functions are composed on protected routes:

1. `authenticateToken` - verifies the Bearer token and attaches `req.userId`.
2. `checkUserExists` - fetches the full User document and attaches `req.user`. Only used on routes that need the user's role, profile data, or sub-documents (e.g. `featuredItems`, `collections`).

Engagement data (likes, saves, follows) is stored in dedicated collections (`Interaction`, `Follow`) and also reflected as denormalised counters on the parent documents (`User.stats`, `Post.stats`). The counters are updated atomically with `$inc` and exist purely for read performance.

---

## Database Models

### User

Stores account credentials, profile data, notification preferences, and cached statistics.

| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique, 4-16 chars, lowercase letters/numbers/underscores only |
| `email` | String | Unique, lowercase |
| `provider` | String | `"google"` or `"opencanvas"` |
| `role` | String | `"user"`, `"moderator"`, or `"admin"` |
| `profilePicture` | String | URL |
| `designation` | String | Max 40 chars |
| `aboutMe` | String | Max 300 chars |
| `interestedIn` | [String] | Max 8 topics |
| `contactInformation` | [ContactInfo] | Public links (title + URL), no `_id` |
| `premiumUser` | Object | Subscription status and dates |
| `stats` | Object | Denormalised counters: followers, following, posts, likesReceived |
| `collections` | [ObjectId] | References to Collection documents, max 50 |
| `featuredItems` | [FeatureItem] | Pinned posts/collections shown on profile, max 8 |
| `lastFiveLogin` | [LoginInfo] | Rolling log of last 5 logins (time, device, IP) |
| `notifications` | Object | Per-type boolean flags |

### Post

Stores the full content and metadata for a written post.

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `content` | String | Full post body (Markdown or rich text) |
| `slug` | String | URL-friendly title fragment |
| `authorId` | ObjectId | Reference to User |
| `authorSnapshot` | Object | Denormalised `username`, `profilePicture`, `fullName` |
| `isPublic` | Boolean | Controls visibility |
| `isEdited` | Boolean | Set to `true` after the first update |
| `type` | String | `written`, `article`, `poem`, `story`, or `social` |
| `tags` | [String] | Max 5 |
| `media` | [String] | Uploaded image URLs |
| `stats` | Object | `viewsCount`, `likesCount`, `dislikesCount`, `sharesCount`, `commentsCount`, `readsCount` |
| `anonymousEngagementScore` | Number | Recalculated every 15 minutes by cron |
| `engagementScore` | Number | Personalised variant (reserved for future use) |

### Collection

A named, ordered list of posts created by a user.

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | |
| `isPrivate` | Boolean | Default `false` |
| `tags` | [String] | Max 5 |
| `authorId` | ObjectId | Reference to User |
| `posts` | [ObjectId] | References to Post documents, max 50 |
| `stats` | Object | `likesCount`, `dislikesCount`, `viewsCount` |

### Follow

A directional edge in the social graph between two users.

| Field | Type | Notes |
|---|---|---|
| `followerId` | ObjectId | The user who is following |
| `followingId` | ObjectId | The user being followed |
| `since` | Date | Creation timestamp (replaces `createdAt`) |

A unique compound index on `(followerId, followingId)` prevents duplicate follows.

### Interaction

Records a user's like, dislike, or save action on a Post, Collection, or Comment.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | |
| `targetId` | ObjectId | Post, Collection, or Comment ID |
| `targetModel` | String | `"Post"`, `"Collection"`, or `"Comment"` |
| `type` | String | `"like"`, `"dislike"`, or `"save"` |

A unique compound index on `(userId, targetId, type)` prevents duplicate interactions.

### Comment

Supports a single level of threading: top-level comments and direct replies.

| Field | Type | Notes |
|---|---|---|
| `content` | String | Max 1000 chars |
| `authorId` | ObjectId | |
| `postId` | ObjectId | The post this comment belongs to |
| `parentId` | ObjectId | `null` for top-level; set to parent comment ID for replies |
| `authorSnapshot` | Object | `username` and `profilePicture` |
| `stats` | Object | `likesCount`, `dislikesCount`, `repliesCount` |

---

## API Reference

All responses follow the shape `{ success: boolean, data?, message?, error? }`. The `error` field is only included in development.

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/google` | None | Initiates the Google OAuth flow |
| GET | `/auth/google/callback` | None | OAuth callback; redirects to frontend with JWT |
| GET | `/auth/user` | Required | Returns the current user's full document |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/u/:username` | Optional | Public profile + `isFollowing` boolean |
| GET | `/u/users/byids?ids=...` | None | Batch-fetch minimal user data by ID |
| PUT | `/update/user` | Required | Update own profile (whitelisted fields only) |

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/p/:slug` | None | Fetch a single public post |
| GET | `/u/posts/byids?ids=...` | None | Batch-fetch public post cards |
| GET | `/u/:userId/posts` | None | Public posts by a specific author (paginated) |
| GET | `/u/posts/mine` | Required | Own posts including private (paginated) |
| GET | `/saved/posts` | Required | Saved posts for the logged-in user (paginated) |
| GET | `/get-new-post-id` | Required | Reserve a new post ObjectId for the editor |
| GET | `/private/p/:slug` | Required | View a private post (author/mod only) |
| GET | `/post/:postId/my-interactions` | Required | Like/dislike/save state for a post |
| POST | `/post/like-dislike` | Required | Toggle like or dislike on a post |
| POST | `/post/save-unsave` | Required | Toggle saved state on a post |
| POST | `/save/post/written` | Required | Create or update a written post (upsert) |
| PUT | `/change-post-visibility-status` | Required | Toggle public/private (author only) |
| PUT | `/change-post-featured-status` | Required | Pin/unpin on profile (author only) |
| PATCH | `/update-post-views/:postId` | None | Increment view counter |
| DELETE | `/post/delete` | Required | Delete a post (author/mod only) |

**Post URL format:** `/p/<title-slug>-<24-char-objectid>`. The ObjectId is always the last segment and is used for the database lookup. The slug is cosmetic.

### Comments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/p/comments/:commentId` | None | Fetch a comment and its replies |
| GET | `/get-comments/byids?ids=...` | None | Batch-fetch comments by ID |
| POST | `/new-comment` | Required | Add a top-level comment to a post |
| POST | `/reply-to-comment` | Required | Reply to an existing comment |
| PUT | `/edit-comment` | Required | Edit own comment |
| DELETE | `/delete-comment` | Required | Delete comment (author/mod only) |

### Collections

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/collections` | None | Browse public collections (paginated) |
| GET | `/c/:collectionId` | None | Public collection + its public posts |
| GET | `/u/:userId/collections` | Required | User's collections (filtered by access) |
| GET | `/c/private/:collectionId` | Required | Private collection (author/mod only) |
| POST | `/create/collection` | Required | Create a new collection |
| POST | `/collection/:collectionId/vote` | Required | Like or dislike a collection |
| PUT | `/update-collection/:collectionId` | Required | Update metadata (author only) |
| PUT | `/add-remove-post/:postId/collection/:collectionId` | Required | Toggle a post in/out (author only) |
| DELETE | `/delete-collection/:collectionId` | Required | Delete a collection (author/mod only) |

### Feed

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/articles` | None | Offset-paginated public feed (newest first) |
| POST | `/articles/anonymous-user` | None | Cursor-paginated feed ranked by engagement score |

The cursor-based feed encodes `{ score, lastId }` as base64 JSON. Pass the returned `nextCursor` value in the next request body to advance the page.

### Follow

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/follow-unfollow/user` | Required | Toggle follow on a user |
| GET | `/u/:userId/followers` | None | Paginated followers list |
| GET | `/u/:userId/following` | Required | Paginated following list |

---

## Authentication Flow

1. The client redirects the user to `GET /auth/google`.
2. Google authenticates the user and redirects to `GET /auth/google/callback`.
3. The server finds or creates a User document, signs a 7-day JWT, and redirects the client to `FRONTEND_URL/auth/success?token=<jwt>`.
4. The frontend stores the token and sends it as `Authorization: Bearer <token>` on all subsequent requests.
5. Protected routes validate the token via `authenticateToken`. Routes that need the full user document additionally call `checkUserExists`.

---

## Access Control

Three roles exist: `user`, `moderator`, and `admin`.

- **Post/comment deletion:** author, moderator, or admin.
- **Private post/collection viewing:** author, moderator, or admin.
- **Collection/post management:** author only (update, feature, visibility, add/remove posts).
- **Follow/save/like:** any authenticated user.
- **Public profile, public posts, public collections, feed:** no authentication required.

---

## Engagement Scoring

The `anonymousEngagementScore` field on Post drives the ranked feed for logged-out users. A cron job runs every 15 minutes and recalculates the score for all posts using a weighted formula that combines views, likes, reads, and recency. The formula lives in `server/src/migrations/Post/updateDefaultEngagementScore.js`.

Posts without a score are not shown in the ranked feed but do appear in the chronological `/articles` feed.

---

## Environment Variables

All variables are read from a `.env` file in the `server/` directory.

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CURRENT_URL` | Public URL of the server (used to build the OAuth callback URL) |
| `FRONTEND_URL` | Public URL of the frontend (used for CORS and post-auth redirects) |
| `NODE_ENV` | `"development"` or `"production"` |

---

## Running Locally

**Prerequisites:** Node.js 18+, MongoDB running locally or a MongoDB Atlas URI.

```bash
# Install server dependencies
cd server
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start the server
node src/index.js
```

```bash
# Install client dependencies
cd client
npm install

# Start the dev server
npm run dev
```

The backend listens on `http://localhost:3000` by default. The Vite dev server runs on `http://localhost:5173` and is included in the CORS allow-list automatically when `NODE_ENV` is not `"production"`.

Alternatively, use the provided shell scripts from the project root:

```bash
./start.sh   # Start both client and server
./stop.sh    # Stop both processes
```
