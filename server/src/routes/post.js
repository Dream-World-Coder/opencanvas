const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const { v4: uuidv4 } = require("uuid");
const { authenticateToken } = require("../middlewares/authorisation");

// save written post
router.post("/savepost/written", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // now if user exists go towards post
        let postData = req.body;
        if (!postData) {
            return res.status(404).json({
                success: false,
                message: "post not found",
            });
        }

        const currentPost = await Post.findById(postData.id);
        let savedPost = {};

        if (currentPost) {
            if (currentPost.authorId.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized to update this post",
                });
            }

            currentPost.title = postData.title;
            currentPost.content = postData.content;
            currentPost.tags = postData.tags;
            currentPost.isPublic = postData.isPublic ?? true;
            currentPost.isEdited = true;
            currentPost.media = postData.media || [];
            savedPost = await currentPost.save();
        } else {
            const post = new Post({
                _id: postData.id,
                title: postData.title,
                content: postData.content,
                authorId: user._id,
                tags: postData.tags,
                postDeleteHash: uuidv4(),
                isEdited: false,
                isPublic: true,
                type: "written",
                media: postData.media || [],
            });

            savedPost = await post.save(); // returns the post
        }

        // append _id of post to user
        if (!user.posts.includes(savedPost._id)) {
            user.posts.push(savedPost._id);
        }
        await user.save();

        return res.status(200).json({
            success: true,
            message: "posted successfully",
            postId: savedPost._id,
        });
    } catch (error) {
        console.error("Get post[written] upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload post[written]",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

// post page
// do not share all details
router.get("/p/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        const currentPost = await Post.findById(postId).select({
            postDeleteHash: 0,
            imgDeleteHash: 0,
        });

        if (!currentPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            currentPost,
        });
    } catch (error) {
        console.error("Get post[written] error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get post[written]",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

// Route to get posts by IDs -- public -- do not show all data, make a new route for that
router.post("/u/posts/byids", authenticateToken, async (req, res) => {
    try {
        // Get the post IDs from the query string
        const data = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "No post IDs provided",
            });
        }

        // Split the comma-separated IDs and ensure they're valid ObjectIDs
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
        })
            .select({
                postDeleteHash: 0,
                imgDeleteHash: 0,
            })
            .sort({ createdAt: -1 }); // newest first

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

module.exports = { router };
