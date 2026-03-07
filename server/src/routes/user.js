const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Follow = require("../models/Follow");
const { cache, TTL } = require("../services/cacheService");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

// ::::: public :::::

// GET /u/:username
// Public profile page. Resolves follow status for logged-in callers via
// optional token inspection (no hard auth, just best-effort).
router.get("/u/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "username fullName profilePicture designation aboutMe interestedIn contactInformation featuredItems stats createdAt",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Optionally resolve whether the caller follows this user.
    // Public route — we inspect the token manually without hard-failing on it.
    let isFollowing = false;
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const follow = await Follow.findOne({
          followerId: decoded.userId,
          followingId: user._id,
        });
        isFollowing = !!follow;
      } catch {
        // Expired or invalid token — skip the follow check, don't block the request
      }
    }

    res.status(200).json({ success: true, data: { user, isFollowing } });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /u/users/byids?ids=id1,id2,...
// Batch-fetch minimal user data by IDs (used for follower/following lists).
router.get("/u/users/byids", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",").filter(Boolean);
    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    const users = await User.find({ _id: { $in: ids } }).select(
      "username fullName profilePicture designation stats",
    );

    res.status(200).json({ success: true, results: users.length, data: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ::::: private :::::

// PUT /update/user
// Update the logged-in user's own profile. Username and email are intentionally excluded.
router.put(
  "/update/user",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const {
        fullName,
        profilePicture,
        designation,
        aboutMe,
        interestedIn,
        contactInformation,
        notifications,
      } = req.body;

      const user = req.user;

      if (fullName !== undefined) user.fullName = fullName;
      if (profilePicture !== undefined) user.profilePicture = profilePicture;
      if (designation !== undefined) user.designation = designation;
      if (aboutMe !== undefined) user.aboutMe = aboutMe;
      if (interestedIn !== undefined) user.interestedIn = interestedIn;
      if (contactInformation !== undefined)
        user.contactInformation = contactInformation;

      // Merge notification prefs instead of replacing the whole object
      if (notifications !== undefined) {
        Object.assign(user.notifications, notifications);
      }

      await user.save();

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: err.message });
      }
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },
);

/**
 * GET /u/top/writers
 *
 * Top 5 writers ranked by likes-per-post ratio.
 * This changes only when someone publishes a post or receives a like —
 * a 5-minute cache is more than acceptable.
 *
 * Cache key : "writers:top"
 * TTL       : TTL.TOP_WRITERS (5 minutes)
 * Busted by : post like/dislike and post create/delete — see post.js
 */
router.get("/u/top/writers", async (req, res) => {
  try {
    const CACHE_KEY = "writers:top";

    // ::::: Cache hit :::::
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, data: cached, fromCache: true });
    }

    // ::::: Cache miss — run the aggregation :::::
    const topWriters = await User.aggregate([
      // Only users with at least one published post (avoids division by zero)
      { $match: { "stats.postsCount": { $gt: 0 } } },

      // Compute likes-per-post as a virtual field
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
          _id: 1,
          username: 1,
          fullName: 1,
          profilePicture: 1,
          designation: 1,
          stats: 1,
          likesPerPost: 1,
        },
      },
    ]);

    cache.set(CACHE_KEY, topWriters, TTL.TOP_WRITERS);

    res.status(200).json({ success: true, data: topWriters });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch top writers",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = { router };
