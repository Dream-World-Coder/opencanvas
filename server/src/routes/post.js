const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Interaction = require("../models/Interaction");
const { cache } = require("../services/cacheService");
const {
  authenticateToken,
  checkUserExists,
  fingerprintMiddleware,
} = require("../middlewares/authorisation");

// ::::: Helpers :::::

// URLs look like /p/my-post-title-64abc123def456789012abcd
// The last 24-char hex segment is always the MongoDB ObjectId
const extractPostId = (slug) => {
  const parts = slug.split("-");
  const last = parts[parts.length - 1];
  return /^[a-f0-9]{24}$/i.test(last) ? last : null;
};

// ::::: public :::::

// GET /p/:slug
// Public post page — resolves the post by extracting the ObjectId from the slug
router.get("/p/:slug", async (req, res) => {
  try {
    const postId = extractPostId(req.params.slug);
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post URL" });
    }

    const post = await Post.findOne({ _id: postId, isPublic: true });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /u/posts/byids?ids=id1,id2,...
// Batch-fetch posts by IDs (used on profile pages to load post cards efficiently)
router.get("/u/posts/byids", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",").filter(Boolean);
    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const posts = await Post.find({ _id: { $in: ids }, isPublic: true }).select(
      "title contentPreview slug type tags readTime thumbnailUrl isPremium authorSnapshot stats createdAt updatedAt",
    );

    res.status(200).json({ success: true, results: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ::::: protected :::::

// GET /get-new-post-id
// Returns a fresh ObjectId for the editor before the post is saved.
router.get("/get-new-post-id", authenticateToken, (req, res) => {
  const newId = new mongoose.Types.ObjectId();
  res.status(200).json({ success: true, data: { postId: newId } });
});

// GET /private/p/:slug
// View a private post — only the author (or mod/admin) can access
router.get(
  "/private/p/:slug",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const postId = req.query.postId ?? extractPostId(req.params.slug);
      if (!postId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post URL" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const isOwner = post.authorId.toString() === req.userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      if (!isOwner && !isMod) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to view this post",
        });
      }

      res.status(200).json({ success: true, data: post });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch private post",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// POST /post/like-dislike
// Like or dislike a post. Same vote twice removes it. Opposite vote switches it.
// Also keeps stats.likesReceivedCount on the author in sync.
//
// Cache: invalidates "writers:top" because likesReceivedCount affects the ranking.
router.post("/post/like-dislike", authenticateToken, async (req, res) => {
  try {
    const { postId, vote } = req.body; // vote: "like" | "dislike"

    if (!postId || !["like", "dislike"].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: "postId and vote ('like'|'dislike') are required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const statField =
      vote === "like" ? "stats.likesCount" : "stats.dislikesCount";
    const oppositeField =
      vote === "like" ? "stats.dislikesCount" : "stats.likesCount";

    const existing = await Interaction.findOne({
      userId: req.userId,
      targetId: postId,
      targetModel: "Post",
    });

    if (existing) {
      if (existing.type === vote) {
        // Same vote → remove
        await existing.deleteOne();
        await Post.findByIdAndUpdate(postId, { $inc: { [statField]: -1 } });
        if (vote === "like") {
          await mongoose.model("User").findByIdAndUpdate(post.authorId, {
            $inc: { "stats.likesReceivedCount": -1 },
          });
        }
        cache.del("writers:top"); // likes changed, ranking may have shifted
        return res.status(200).json({ success: true, message: "Vote removed" });
      } else {
        // Opposite vote → switch
        existing.type = vote;
        await existing.save();
        await Post.findByIdAndUpdate(postId, {
          $inc: { [statField]: 1, [oppositeField]: -1 },
        });
        const likesDelta = vote === "like" ? 1 : -1;
        await mongoose.model("User").findByIdAndUpdate(post.authorId, {
          $inc: { "stats.likesReceivedCount": likesDelta },
        });
        cache.del("writers:top");
        return res
          .status(200)
          .json({ success: true, message: "Vote switched" });
      }
    }

    // No prior vote → add it
    await Interaction.create({
      userId: req.userId,
      targetId: postId,
      targetModel: "Post",
      type: vote,
    });
    await Post.findByIdAndUpdate(postId, { $inc: { [statField]: 1 } });
    if (vote === "like") {
      await mongoose.model("User").findByIdAndUpdate(post.authorId, {
        $inc: { "stats.likesReceivedCount": 1 },
      });
    }
    cache.del("writers:top");

    res.status(201).json({ success: true, message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to vote on post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /post/save-unsave
// Toggle save state for a post (stored as an Interaction with type "save").
router.post("/post/save-unsave", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: "postId is required" });
    }

    const existing = await Interaction.findOne({
      userId: req.userId,
      targetId: postId,
      targetModel: "Post",
      type: "save",
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, message: "Post unsaved" });
    }

    await Interaction.create({
      userId: req.userId,
      targetId: postId,
      targetModel: "Post",
      type: "save",
    });
    res.status(201).json({ success: true, message: "Post saved" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to save/unsave post",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /save/post/written
// Create or update a written post (upsert by _id).
// The post ID was pre-generated by GET /get-new-post-id.
//
// Cache: always busts "articles:" because the feed order or content may have changed.
router.post(
  "/save/post/written",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const {
        postId,
        title,
        content,
        slug,
        tags,
        type,
        readTime,
        thumbnailUrl,
        isPremium,
        isPublic,
      } = req.body;

      if (!postId || !title || !content) {
        return res.status(400).json({
          success: false,
          message: "postId, title and content are required",
        });
      }

      const isNew = !(await Post.exists({ _id: postId }));

      const postData = {
        title,
        contentPreview: content?.slice(0, 700) ?? "", // truncated for feed cards
        content,
        slug,
        tags,
        type,
        readTime,
        thumbnailUrl,
        isPremium,
        isPublic,
        authorId: req.userId,
        // Always keep snapshot current — avoids stale author data in feed cards
        authorSnapshot: {
          username: req.user.username,
          profilePicture: req.user.profilePicture,
          fullName: req.user.fullName,
        },
        isEdited: !isNew,
      };

      const post = await Post.findByIdAndUpdate(
        postId,
        { $set: postData },
        { upsert: true, new: true, runValidators: true },
      );

      if (isNew) {
        await mongoose.model("User").findByIdAndUpdate(req.userId, {
          $inc: { "stats.postsCount": 1 },
        });
      }

      // A new public post (or an edit to one) changes the feed
      if (isPublic) {
        cache.invalidatePrefix("articles:");
      }

      res.status(isNew ? 201 : 200).json({ success: true, data: post });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to save post",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// PUT /change-post-visibility-status
// Toggle a post between public and private. Author only.
//
// Cache: busts "articles:" because the post either enters or leaves the public feed.
router.put(
  "/change-post-visibility-status",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId } = req.body;
      if (!postId) {
        return res
          .status(400)
          .json({ success: false, message: "postId is required" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      if (post.authorId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorised" });
      }

      post.isPublic = !post.isPublic;
      await post.save();

      cache.invalidatePrefix("articles:");

      res.status(200).json({
        success: true,
        message: `Post is now ${post.isPublic ? "public" : "private"}`,
        data: post,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to change post visibility",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// PUT /change-post-featured-status
// Add or remove a post from the author's featuredItems on their profile. Author only.
router.put(
  "/change-post-featured-status",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId } = req.body;
      if (!postId) {
        return res
          .status(400)
          .json({ success: false, message: "postId is required" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      if (post.authorId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorised" });
      }

      const alreadyFeatured = req.user.featuredItems.some(
        (item) =>
          item.itemId?.toString() === postId && item.itemType === "Post",
      );

      if (alreadyFeatured) {
        req.user.featuredItems = req.user.featuredItems.filter(
          (item) =>
            !(item.itemId?.toString() === postId && item.itemType === "Post"),
        );
      } else {
        if (req.user.featuredItems.length >= 8) {
          return res.status(400).json({
            success: false,
            message: "Maximum 8 featured items allowed",
          });
        }
        req.user.featuredItems.push({
          itemId: post._id,
          itemType: "Post",
          itemTitle: post.title,
          itemThumbnail: post.thumbnailUrl,
        });
      }

      await req.user.save();

      res.status(200).json({
        success: true,
        message: alreadyFeatured
          ? "Post removed from featured"
          : "Post added to featured",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to change featured status",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// DELETE /post/delete
// Permanently delete a post. Author or mod/admin only.
//
// Cache: busts "articles:" (post leaves feed) and "writers:top" (postsCount changes ratio).
router.delete(
  "/post/delete",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId } = req.body;
      if (!postId) {
        return res
          .status(400)
          .json({ success: false, message: "postId is required" });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const isOwner = post.authorId.toString() === req.userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      if (!isOwner && !isMod) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to delete this post",
        });
      }

      await post.deleteOne();

      await mongoose.model("User").findByIdAndUpdate(post.authorId, {
        $inc: { "stats.postsCount": -1 },
      });

      cache.invalidatePrefix("articles:");
      cache.del("writers:top");

      res.status(200).json({ success: true, message: "Post deleted" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to delete post",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// PATCH /update-post-views/:slug
// Increments view count. Uses fingerprinting to avoid double-counting.
router.patch(
  "/update-post-views/:slug",
  fingerprintMiddleware,
  async (req, res) => {
    try {
      const postId = extractPostId(req.params.slug || "none");
      await Post.findByIdAndUpdate(postId, {
        $inc: { "stats.viewsCount": 1 },
      });
      res.status(200).json({ success: true, message: "View counted" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to update views",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// GET /u/posts/mine?page=1&limit=20
// Returns the logged-in user's own posts, including private ones
router.get("/u/posts/mine", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ authorId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ authorId: req.userId }),
    ]);

    res.status(200).json({ success: true, data: posts, total });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /u/:userId/posts?page=1&limit=20
// Public posts by a specific author
router.get("/u/:userId/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ authorId: req.params.userId, isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats createdAt updatedAt",
        ),
      Post.countDocuments({ authorId: req.params.userId, isPublic: true }),
    ]);

    res.status(200).json({ success: true, data: posts, total });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /saved/posts?page=1&limit=20
// Returns the logged-in user's saved posts via the Interaction collection
router.get("/saved/posts", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [saves, total] = await Promise.all([
      Interaction.find({
        userId: req.userId,
        targetModel: "Post",
        type: "save",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "targetId",
          model: "Post",
          select:
            "title contentPreview slug type tags readTime thumbnailUrl isPremium isPublic authorSnapshot stats createdAt",
        }),
      Interaction.countDocuments({
        userId: req.userId,
        targetModel: "Post",
        type: "save",
      }),
    ]);

    // filter(Boolean) handles the case where a saved post was later deleted
    const posts = saves.map((s) => s.targetId).filter(Boolean);

    res.status(200).json({ success: true, data: posts, total });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved posts",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /post/:postId/my-interactions
// Returns the logged-in user's like/dislike/save state for a single post
router.get(
  "/post/:postId/my-interactions",
  authenticateToken,
  async (req, res) => {
    try {
      const interactions = await Interaction.find({
        userId: req.userId,
        targetId: req.params.postId,
        targetModel: "Post",
      });
      res.status(200).json({
        success: true,
        data: {
          isLiked: interactions.some((i) => i.type === "like"),
          isDisliked: interactions.some((i) => i.type === "dislike"),
          isSaved: interactions.some((i) => i.type === "save"),
        },
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch interactions" });
    }
  },
);

module.exports = { router };
