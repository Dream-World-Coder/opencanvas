const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

const {
    handleAuthErrors,
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");

// follow-unfollow
router.put(
    "/follow-user",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        try {
            const user = req.user;
            const { followId } = req.query;

            if (!followId) {
                console.log("!followId");
                return res.status(404).json({
                    success: false,
                    message: "follow id not found",
                });
            }
            if (followId.toString() === user._id.toString()) {
                return res.status(208).json({
                    success: false,
                    message: "You cannot follow your account",
                });
            }
            if (!mongoose.Types.ObjectId.isValid(followId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid follow ID",
                });
            }
            const personToFollow = await User.findById(followId);
            if (!personToFollow) {
                console.log("!personToFollow");
                return res.status(404).json({
                    success: false,
                    message: "User to follow not found",
                });
            }
            // unfollow if already following
            if (
                user.following
                    .map((item) => item.userId.toString())
                    .includes(followId.toString())
            ) {
                // remove from following
                user.following = user.following.filter(
                    (item) => item.userId.toString() !== followId.toString(),
                );
                await user.save();

                // remove from followers
                personToFollow.followers = personToFollow.followers.filter(
                    (item) => item.userId.toString() !== user._id.toString(),
                );
                await personToFollow.save();

                return res.status(200).json({
                    success: true,
                    message: "unfollowed",
                });
            }
            user.following.push({ userId: followId, since: Date.now() });
            await user.save();
            personToFollow.followers.push({
                userId: user._id,
                since: Date.now(),
            });
            await personToFollow.save();
            return res.status(200).json({
                success: true,
                message: "followed",
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

// get followers by ids
router.post("/u/posts/byids", authenticateToken, async (req, res) => {
    try {
        // query string, need to split
        const data = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "No post IDs provided",
            });
        }

        // splitting query str _ids & valid Object ids check
        const postIds = data.postIds
            .split(",")
            .filter((id) => mongoose.Types.ObjectId.isValid(id));

        if (postIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid post IDs provided",
            });
        }

        const posts = await Post.find({
            _id: { $in: postIds },
        }).sort({ createdAt: -1 }); // newest first

        return res.status(200).json({
            success: true,
            posts: posts,
        });
    } catch (error) {
        console.error("Error fetching posts by IDs:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

router.use(handleAuthErrors);

module.exports = { router };
