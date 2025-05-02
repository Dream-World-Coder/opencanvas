const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const {
    authenticateToken,
    checkUserExists,
} = require("../middlewares/authorisation");

/**
 * new comment
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

        const session = await mongoose.startSession();
        session.startTransaction();
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
            const newComment = await comment.save({ session });

            post.comments.push(comment._id);
            post.totalComments += 1;
            await post.save({ session });
            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message: "comment added.",
                comment: newComment,
            });
        } catch (error) {
            await session.abortTransaction();
            console.error(error);
            return res.status(500).json({
                success: false,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        } finally {
            session.endSession();
        }
    },
);

/**
 * edit comment
 */
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

            return res.status(200).json({
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

/**
 * delete comment
 */
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
        const session = await mongoose.startSession();
        session.startTransaction();
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
                await currentComment.save({ session });
            } else {
                await currentComment.remove({ session });
                // await Comment.findByIdAndDelete(commentId);
            }

            const post = await Post.findById(currentComment.postId);
            post.totalComments -= 1;
            await post.save({ session });

            await session.commitTransaction();

            return res.status(200).json({
                success: true,
                message: "comment deleted.",
            });
        } catch (error) {
            await session.abortTransaction();
            console.error(error);
            return res.status(500).json({
                success: false,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        } finally {
            session.endSession();
        }
    },
);

/**
 * reply to a comment
 */
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

        const session = await mongoose.startSession();
        session.startTransaction();
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
            const newReply = await comment.save({ session });

            //
            parentComment.replies.push(newReply._id);
            await parentComment.save({ session });
            await session.commitTransaction();

            // increasing post total-comments
            const post = await Post.findById(postId);
            post.totalComments += 1;
            await post.save({ session });

            return res.status(200).json({
                success: true,
                message: "reply added.",
                comment: newReply,
            });
        } catch (error) {
            await session.abortTransaction();
            console.error(error);
            return res.status(500).json({
                success: false,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : "Server error",
            });
        } finally {
            session.endSession();
        }
    },
);

// fetch comments
/**
 * fetch single comment with all replies
 */
router.get("/p/comments/:commentId", authenticateToken, async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        return res.status(404).json({
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
 */
router.post("/get-comments-byids", authenticateToken, async (req, res) => {
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

        return res.status(200).json({
            success: true,
            comments,
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
