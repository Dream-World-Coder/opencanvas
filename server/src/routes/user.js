const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Collection = require("../models/Collection");

const {
  handleAuthErrors,
  authenticateToken,
  checkUserExists,
} = require("../middlewares/authorisation");

/**
 *******************************************************
 * update user data
 */
router.put(
  "/update-user",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const user = req.user;
      let {
        username,
        fullName,
        designation,
        aboutMe,
        notifications,
        contactInformation,
      } = req.body;

      username = username.trim();
      fullName = fullName.trim();
      designation = designation.trim();
      aboutMe = aboutMe.trim();

      // Check if username is being changed
      if (username && username !== user.username) {
        // Check for username uniqueness
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username already taken",
          });
        }

        // Validate username length
        if (username.length < 4) {
          return res.status(400).json({
            success: false,
            message: "Username must be at least 4 characters long",
          });
        }

        if (username.length > 16) {
          return res.status(400).json({
            success: false,
            message: "Username can be 16 characters long at max",
          });
        }

        // should contain only A-z, 0-9, and _
        if (!/^(?!\d+$)[a-z0-9_]+$/.test(username)) {
          return res.status(400).json({
            success: false,
            message:
              "Username can only contain letters, numbers, and underscores",
          });
        }

        user.username = username.toLowerCase();
      }

      // Validate and update fullName if provided
      if (fullName) {
        if (fullName && (fullName.length < 4 || fullName.length > 32)) {
          return res.status(400).json({
            success: false,
            message:
              fullName.length < 4
                ? "Fullname must be at least 4 characters long"
                : "Fullname can be 32 characters long at max",
          });
        }
        user.fullName = fullName;
      }

      if (designation) {
        if (designation.length > 40) {
          return res.status(400).json({
            success: false,
            message: "Designation can be 40 characters or less",
          });
        }
        user.designation = designation;
      }

      // Update aboutMe if provided
      if (aboutMe) {
        if (aboutMe && aboutMe.length > 300) {
          return res.status(400).json({
            success: false,
            message: "About must be 300 characters or less",
          });
        }
        user.aboutMe = aboutMe;
      }

      // Update notifications choices if provided
      if (notifications) {
        if (notifications && typeof notifications !== "object") {
          return res.status(400).json({
            success: false,
            message: "error setting notification settings",
          });
        }
        // console.log(notifications);
        user.notifications.emailNotification = notifications.email;
        user.notifications.pushNotification = notifications.push;

        user.notifications.mentionNotification = notifications.mentions;
        user.notifications.followNotification = notifications.follows;
        user.notifications.commentNotification = notifications.comments;
        user.notifications.messageNotification = notifications.messages;
      }

      if (contactInformation !== undefined) {
        user.contactInformation = contactInformation;
      }

      const savedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: savedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Server error",
      });
    }
  },
);

/**
 *******************************************************
 * public profile view
 * need to set it as id
 */
router.get("/u/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    }).select({
      email: 0,
      provider: 0,
      ipAddress: 0,
      lastFiveLogin: 0,
      savedPosts: 0,
      likedPosts: 0,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.posts = [...user.posts].reverse();

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user data",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
});

/**
 *******************************************************
 * get author by id -- limited data like public profile, but getting by id instead username
 */
async function getUserPublicProfileById(req, res) {
  try {
    const author = await User.findOne({
      _id: req.params.id,
    }).select({
      email: 0,
      provider: 0,
      ipAddress: 0,
      lastFiveLogin: 0,
      savedPosts: 0,
      likedPosts: 0,
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    author.posts = [...author.posts].reverse();

    return res.status(200).json({
      success: true,
      author,
    });
  } catch (error) {
    console.error("Get author error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve author data",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
}
router.get("/author/:id", getUserPublicProfileById);
router.get("/follower/:id", getUserPublicProfileById);
router.get("/following/:id", getUserPublicProfileById);

/**
 *******************************************************
 * change post featured or not
 */
router.put(
  "/change-post-featured",
  authenticateToken,
  checkUserExists,
  async (req, res) => {
    try {
      const user = req.user;
      const data = req.body;
      const itemId = data.itemId;
      const itemType = data.itemType;

      if (!itemId || !itemType) {
        return res.status(404).json({
          success: false,
          message: "itemid / itemtype not found",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid itemId" });
      }

      let Model = null;
      if (itemType === "Post") {
        Model = Post;
      } else if (itemType === "Collection") {
        Model = Collection;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid itemType" });
      }

      const item = await Model.findById(itemId);
      if (!item) {
        return res
          .status(400)
          .json({ success: false, message: `${itemType} not found` });
      }
      if (!item.isPublic) {
        return res.status(400).json({
          success: false,
          message: `${itemType} is private, make public first`,
        });
      }

      if (
        user.featuredItems
          .map((item) => item.itemId.toString())
          .includes(itemId.toString())
      ) {
        user.featuredItems = user.featuredItems.filter(
          (item) => item.itemId.toString() !== itemId.toString(),
        );
        await user.save();

        return res.status(200).json({
          success: true,
          message: `${itemType} removed from features`,
          added: false,
        });
      }

      user.featuredItems.push({
        itemId,
        itemType,
        itemTitle: item.title,
        itemThumbnail: item.thumbnailUrl || null,
      });
      await user.save();

      return res.status(200).json({
        success: true,
        message: `${itemType} featured`,
        added: true,
      });
    } catch (err) {
      console.log("Error liking post", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

router.use(handleAuthErrors);

module.exports = { router };
