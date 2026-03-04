const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Follow = require("../models/Follow");
const {
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /u/:username
// Public profile page - returns limited, safe-to-expose fields only.
// Also returns whether the requesting user (if logged in) follows this profile.
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
    // We read the token manually here since this is a public route - no hard auth required.
    let isFollowing = false;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
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
        // Invalid/expired token - just skip the follow check, don't block the request
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
// Batch-fetch minimal user data by IDs.
// Used on profile pages to show follower/following lists without over-fetching.
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

// ─── Private Routes ───────────────────────────────────────────────────────────

// PUT /update/user
// Update the logged-in user's own profile. Only whitelisted fields are accepted.
// Username and email changes are intentionally not allowed here.
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

      // Merge notification preferences instead of replacing the whole object
      if (notifications !== undefined) {
        Object.assign(user.notifications, notifications);
      }

      await user.save();

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      // Mongoose validation errors (e.g. maxlength, custom validators) come back as 400
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

// GET /u/top/writers
// Returns the top 4 writers ranked by likes-per-post ratio (likesReceivedCount / postsCount).
// Only users with at least 1 post are considered to avoid division by zero.
router.get("/u/top/writers", async (req, res) => {
  try {
    const topWriters = await User.aggregate([
      // Only include users who have published at least one post
      { $match: { "stats.postsCount": { $gt: 0 } } },

      // Compute the likes-per-post ratio as a virtual field
      {
        $addFields: {
          likesPerPost: {
            $divide: ["$stats.likesReceivedCount", "$stats.postsCount"],
          },
        },
      },

      // Best ratio first
      { $sort: { likesPerPost: -1 } },

      { $limit: 4 },

      // Return only the fields the client needs
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
