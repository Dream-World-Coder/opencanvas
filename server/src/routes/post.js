const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { v4: uuidv4 } = require("uuid");
const {
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");
const { generateRandomThumbnail } = require("../utils/helper");

// in js {} & [] are true value

// send generated _id for new post
router.post(
    "/newpost/written/getId",
    authenticateToken,
    // checkUserExists, // no need, user will be authenticated
    async (req, res) => {
        try {
            const newPostId = new mongoose.Types.ObjectId().toString();
            res.status(200).json({
                success: true,
                newPostId: newPostId,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        }
    },
);

// save written post
router.post(
    "/savepost/written",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        try {
            let user = req.user;

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
                currentPost.isEdited = true;
                currentPost.isPublic = postData.isPublic ?? true; // nullish coalescing operator
                currentPost.thumbnailUrl =
                    postData.thumbnailUrl || currentPost.thumbnailUrl;
                currentPost.media = postData.media || [];

                savedPost = await currentPost.save();
            } else {
                const post = new Post({
                    _id: postData.id,
                    title: postData.title,
                    content: postData.content,
                    authorId: user._id,
                    author: {
                        name: user.fullName,
                        profilePicture: user.profilePicture,
                        role: user.role,
                    },
                    tags: postData.tags,
                    isEdited: false,
                    isPublic: postData.isPublic ?? true,
                    type: postData.artType ?? "written", // artType cannot be changed, its fixed
                    thumbnailUrl:
                        postData.thumbnailUrl ||
                        generateRandomThumbnail(postData.artType),
                    readTime: postData.readTime,
                    media: postData.media,
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
                message: "Failed to upload post",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        }
    },
);

// post page
router.get("/p/:postId", async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        const post = await Post.findById(postId);
        //     .select({
        //     imgDeleteHash: 0,
        // });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            post,
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
            // .select({
            //     imgDeleteHash: 0,
            // })
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
