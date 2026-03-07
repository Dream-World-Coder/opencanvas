const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Atomically update a post's commentsCount. delta = +1 or -1.
const updatePostCommentCount = (postId, delta) =>
  Post.findByIdAndUpdate(postId, { $inc: { "stats.commentsCount": delta } });

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /p/:postId/comments?page=1&limit=10
// Paginated top-level comments for a post. Replies are excluded and loaded on demand.
router.get("/p/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // parentId: null → top-level comments only, not replies
    const comments = await Comment.find({ postId, parentId: null })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      results: comments.length,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /p/comments/:commentId
// Single top-level comment + all its direct replies
router.get("/p/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const replies = await Comment.find({ parentId: commentId }).sort({
      createdAt: 1,
    });

    res.status(200).json({ success: true, data: { comment, replies } });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /get-comments/byids?ids=id1,id2,...
// Batch-fetch comments by ID list (used on the post page)
router.get("/get-comments/byids", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",").filter(Boolean);
    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const comments = await Comment.find({ _id: { $in: ids } });

    res
      .status(200)
      .json({ success: true, results: comments.length, data: comments });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ─── Protected Routes (login required) ───────────────────────────────────────

// POST /new-comment
// Creates a top-level comment on a post and increments the post's commentsCount.
router.post(
  "/new-comment",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId, content } = req.body;
      if (!postId || !content) {
        return res
          .status(400)
          .json({ success: false, message: "postId and content are required" });
      }

      const comment = await Comment.create({
        content,
        postId,
        authorId: req.userId,
        // Snapshot avoids a populate() call on every feed/comment read
        authorSnapshot: {
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });

      // Keep post comment counter in sync
      await updatePostCommentCount(postId, 1);

      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to create comment",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// POST /reply-to-comment
// Creates a reply to an existing comment. Increments:
//   - parent comment's repliesCount
//   - post's commentsCount (a reply counts as a comment)
router.post(
  "/reply-to-comment",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { postId, parentId, content } = req.body;
      if (!postId || !parentId || !content) {
        return res.status(400).json({
          success: false,
          message: "postId, parentId and content are required",
        });
      }

      // Ensure the parent comment exists before creating the reply
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ success: false, message: "Parent comment not found" });
      }

      const reply = await Comment.create({
        content,
        postId,
        parentId,
        authorId: req.userId,
        authorSnapshot: {
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });

      // Update both counters atomically in parallel — no need to await sequentially
      await Promise.all([
        Comment.findByIdAndUpdate(parentId, {
          $inc: { "stats.repliesCount": 1 },
        }),
        updatePostCommentCount(postId, 1),
      ]);

      res.status(201).json({ success: true, data: reply });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to post reply",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// PUT /edit-comment
// Edit comment content. Only the original author is allowed.
router.put(
  "/edit-comment",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { commentId, content } = req.body;
      if (!commentId || !content) {
        return res.status(400).json({
          success: false,
          message: "commentId and content are required",
        });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      }

      if (comment.authorId.toString() !== req.userId) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorised to edit this comment",
          });
      }

      comment.content = content;
      await comment.save();

      res.status(200).json({ success: true, data: comment });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to edit comment",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// DELETE /delete-comment
// Deletes a comment (author or mod/admin only). Decrements:
//   - post's commentsCount
//   - parent's repliesCount (if this is a reply)
router.delete(
  "/delete-comment",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { commentId } = req.body;
      if (!commentId) {
        return res
          .status(400)
          .json({ success: false, message: "commentId is required" });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      }

      const isAuthor = comment.authorId.toString() === req.userId;
      const isMod = ["moderator", "admin"].includes(req.user.role);
      if (!isAuthor && !isMod) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorised to delete this comment",
          });
      }

      await comment.deleteOne();

      // Build all counter updates and fire them in parallel
      const counterUpdates = [updatePostCommentCount(comment.postId, -1)];

      // If this is a reply, also decrement the parent's repliesCount
      if (comment.parentId) {
        counterUpdates.push(
          Comment.findByIdAndUpdate(comment.parentId, {
            $inc: { "stats.repliesCount": -1 },
          }),
        );
      }

      await Promise.all(counterUpdates);

      res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to delete comment",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

module.exports = { router };
