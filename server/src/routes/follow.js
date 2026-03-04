const express = require("express");
const router = express.Router();
const Follow = require("../models/Follow");
const User = require("../models/User");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

// POST /follow-unfollow/user
// Toggle follow on a user. Following adds a Follow doc and increments both counters.
// Unfollowing removes it and decrements.
router.post(
  "/follow-unfollow/user",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res
          .status(400)
          .json({ success: false, message: "targetUserId is required" });
      }

      if (targetUserId === req.userId) {
        return res
          .status(400)
          .json({ success: false, message: "You cannot follow yourself" });
      }

      // Make sure the target user exists before creating a follow relationship
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const existing = await Follow.findOne({
        followerId: req.userId,
        followingId: targetUserId,
      });

      if (existing) {
        // Already following → unfollow
        await existing.deleteOne();

        // Decrement both sides atomically
        await User.findByIdAndUpdate(req.userId, {
          $inc: { "stats.followingCount": -1 },
        });
        await User.findByIdAndUpdate(targetUserId, {
          $inc: { "stats.followersCount": -1 },
        });

        return res.status(200).json({ success: true, message: "Unfollowed" });
      }

      // Not following yet → follow
      await Follow.create({
        followerId: req.userId,
        followingId: targetUserId,
      });

      await User.findByIdAndUpdate(req.userId, {
        $inc: { "stats.followingCount": 1 },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { "stats.followersCount": 1 },
      });

      res.status(201).json({ success: true, message: "Followed" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to follow/unfollow",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

// GET /u/:userId/followers?page=1&limit=10
// Returns paginated followers with user data + followed-since date
router.get("/u/:userId/followers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Each Follow doc has followerId, followingId, since
    const follows = await Follow.find({ followingId: req.params.userId })
      .sort({ since: -1 })
      .skip(skip)
      .limit(limit)
      .populate("followerId", "username fullName profilePicture designation");

    const total = await Follow.countDocuments({
      followingId: req.params.userId,
    });

    const data = follows.map((f) => ({
      ...f.followerId.toObject(),
      since: f.since,
    }));

    res.status(200).json({ success: true, data, total });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch followers",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});
// GET /u/:userId/following?page=1&limit=10
router.get("/u/:userId/following", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ followerId: req.params.userId })
      .sort({ since: -1 })
      .skip(skip)
      .limit(limit)
      .populate("followingId", "username fullName profilePicture designation");

    const total = await Follow.countDocuments({
      followerId: req.params.userId,
    });

    const data = follows.map((f) => ({
      ...f.followingId.toObject(),
      since: f.since,
    }));

    res.status(200).json({ success: true, data, total });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch following",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});
module.exports = { router };
