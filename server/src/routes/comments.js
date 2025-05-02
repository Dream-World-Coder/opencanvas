const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const {
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");

/*
- [x] new Comment
- [x] edit comment
- [x] delete Comment
- [x] reply to a Comment
*/

router.post(
    "/new-comment",
    authenticateToken,
    // checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (!commentInformation) {
            return res.status(404).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const postId = commentInformation.postId;
        const authorId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ error: "Invalid author ID" });
        }

        try {
            const comment = new Comment({
                content: commentContent,
                authorId,
                postId,
            });
            const newComment = await comment.save();

            res.status(200).json({
                success: true,
                message: "comment added.",
                comment: newComment,
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

router.put(
    "/edit-comment",
    authenticateToken,
    // checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (!commentInformation) {
            return res.status(404).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const commentId = commentInformation.commentId;

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

            res.status(200).json({
                success: true,
                message: "comment updated.",
                comment,
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

router.delete(
    "/delete-comment",
    authenticateToken,
    // checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (!commentInformation) {
            return res.status(404).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentId = commentInformation.commentId;

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

            const comment = await currentComment.delete();

            res.status(200).json({
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

router.post(
    "/reply-to-a-comment",
    authenticateToken,
    // checkUserExists,
    async (req, res) => {
        const commentInformation = req.body;
        if (!commentInformation) {
            return res.status(404).json({
                success: false,
                message: "comment information not found",
            });
        }

        const commentContent = commentInformation.content;
        const authorId = req.userId;
        const postId = commentInformation.postId;
        const parentId = commentInformation.parentId;
        const isReply = true;

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

            parentComment.replies.push(newReply._id);
            await parentComment.save();

            res.status(200).json({
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
module.exports = { router };
