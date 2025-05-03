const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const {
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");

// when a post is deletd then schedule all its comments deletion

/**
 * new comment
 */
router.post(
    "/new-comment",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (
            !commentInformation ||
            !commentInformation.content ||
            !commentInformation.postId
        ) {
            return res.status(400).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const postId = commentInformation.postId;
        const authorId = req.userId;

        if (!commentContent || commentContent.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ error: "Invalid author ID" });
        }

        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "post not found",
                });
            }

            const comment = new Comment({
                content: commentContent,
                authorId,
                postId,
            });
            const newComment = await comment.save();

            post.comments.push(comment._id);
            post.totalComments += 1;
            await post.save();

            const commentObj = newComment.toObject();
            commentObj.author = {
                _id: req.user._id,
                fullName: req.user.fullName,
                username: req.user.username,
                profilePicture: req.user.profilePicture,
                role: req.user.role,
            };

            return res.status(200).json({
                success: true,
                message: "comment added.",
                comment: commentObj,
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

/**
 * edit comment
 */
router.put(
    "/edit-comment",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (
            !commentInformation ||
            !commentInformation.commentId ||
            !commentInformation.content
        ) {
            return res.status(400).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const commentId = commentInformation.commentId;

        if (!commentContent || commentContent.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        try {
            const currentComment = await Comment.findById(commentId);

            if (!currentComment) {
                return res.status(404).json({
                    success: false,
                    message: "comment not found",
                });
            }

            if (req.userId.toString() !== currentComment.authorId.toString()) {
                return res.status(401).json({
                    success: false,
                    message: "unauthorised to edit comment",
                });
            }

            currentComment.content = commentContent;

            const comment = await currentComment.save();
            const commentObj = comment.toObject();
            commentObj.author = {
                _id: req.user._id,
                fullName: req.user.fullName,
                username: req.user.username,
                profilePicture: req.user.profilePicture,
                role: req.user.role,
            };

            return res.status(200).json({
                success: true,
                message: "comment updated.",
                comment: commentObj,
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

/**
 * delete comment
 */
router.delete(
    "/delete-comment",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        const commentId = req.query.commentId;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "No comment ID provided",
            });
        }

        try {
            const currentComment = await Comment.findById(commentId);

            if (!currentComment) {
                return res.status(404).json({
                    success: false,
                    message: "comment not found",
                });
            }

            if (req.userId.toString() !== currentComment.authorId.toString()) {
                return res.status(401).json({
                    success: false,
                    message: "unauthorised to delete comment",
                });
            }

            if (currentComment.replies.length > 0) {
                currentComment.content = "deleted";
                currentComment.authorId = "deletedAccount";
                await currentComment.save();
            } else {
                await Comment.findByIdAndDelete(commentId);
            }

            const post = await Post.findById(currentComment.postId);
            post.totalComments -= 1;
            await post.save();

            return res.status(200).json({
                success: true,
                message: "comment deleted.",
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

/**
 * reply to a comment
 */
router.post(
    "/reply-to-a-comment",
    authenticateToken,
    checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (
            !commentInformation ||
            !commentInformation.content ||
            !commentInformation.postId ||
            !commentInformation.parentId
        ) {
            return res.status(400).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const authorId = req.userId;
        const postId = commentInformation.postId;
        const parentId = commentInformation.parentId;
        const isReply = true;

        if (!commentContent || commentContent.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ error: "Invalid author ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({ error: "Invalid parent comment ID" });
        }

        try {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: "parent comment not found",
                });
            }

            const comment = new Comment({
                content: commentContent,
                authorId,
                postId,
                isReply,
                parentId,
            });
            const newReply = await comment.save();

            newReply.author = {
                _id: req.user._id,
                fullName: req.user.fullName,
                username: req.user.username,
                profilePicture: req.user.profilePicture,
                role: req.user.role,
            };

            // updating parent comment
            parentComment.replies.push(newReply._id);
            await parentComment.save();

            // increasing post total-comments
            const post = await Post.findById(postId);
            post.totalComments += 1;
            await post.save();

            return res.status(200).json({
                success: true,
                message: "reply added.",
                comment: newReply,
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

// fetch comments
/**
 * fetch single comment with all replies : fetch author info here
 */
router.get("/p/comments/:commentId", authenticateToken, async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        return res.status(400).json({
            success: false,
            message: "No comment ID provided",
        });
    }
    try {
        const comment = await Comment.findById({ commentId });
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "comment not found",
            });
        }

        const replies = [];
        if (comment.replies.length > 0) {
            for (let i = 0; i < comment.replies.length; i++) {
                let commentId = comment.replies[i];
                let comment = Comment.findById(commentId);
                replies.push(comment);
            }
        }

        return res.status(200).json({
            success: true,
            comment,
            replies,
        });
    } catch (error) {
        console.error("Error getting comment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get comment",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

/**
 * fetch multiple comments by their ids
 * need to add a cursor based approach instead getting all
 */
router.post("/get-comments-byids", authenticateToken, async (req, res) => {
    try {
        // query string, need to split
        const data = req.body;

        if (!data || !data.commentIds) {
            return res.status(400).json({
                success: false,
                message: "No post IDs provided",
            });
        }

        // splitting query str _ids & valid Object ids check
        const commentIds = data.commentIds
            .split(",")
            .filter((id) => mongoose.Types.ObjectId.isValid(id));

        if (commentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid comment IDs provided",
            });
        }

        const comments = await Comment.find({
            _id: { $in: commentIds },
        }).sort({ createdAt: -1 }); // newest first // query string is in that order but still sorting

        const commentsWithAuthorInfo = [];
        // fetch author of every comment and then add them in a new `author` attribute
        for (let comment of comments) {
            const commentObj = comment.toObject();
            let authorInfo = await User.findById(comment.authorId).select({
                _id: 1,
                fullName: 1,
                username: 1,
                profilePicture: 1,
                role: 1,
            });
            commentObj.author = authorInfo;
            commentsWithAuthorInfo.push(commentObj);
        }

        return res.status(200).json({
            success: true,
            comments: commentsWithAuthorInfo,
        });
    } catch (error) {
        console.error("Error getting comments by IDs:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get comments",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Server error",
        });
    }
});

module.exports = { router };
