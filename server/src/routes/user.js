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

// public profile page. gets follow sts for logged in callers via optional token check
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

    // optional: check whether the caller follows this usr
    // as public route, so inspecting token manually without hard failing on it
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
        // expired / invalid tok -> skipping the follow check not blocking the req
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

// I used this in follower folloing previously
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

// update the logged-in user's self profile, username & email -> can't be changed
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

      // merge notif prefs instead replacing whole obj
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
 * top 5 writers by likes-per-post ratio.
 * This changes when someone publishes a post or receives a like
 * 5 minute cache here
 *
 * cache key: "writers:top"
 * TTL: TTL.TOP_WRITERS (5 minutes)
 * busted by: post like/dislike and post create/delete
 */
router.get("/u/top/writers", async (req, res) => {
  try {
    const CACHE_KEY = "writers:top";

    // cache hit
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, data: cached, fromCache: true });
    }

    // cache miss -> now the aggregation runs
    const topWriters = await User.aggregate([
      // at least 1 post published
      { $match: { "stats.postsCount": { $gt: 0 } } },

      // likes-per-post: virtual field
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
