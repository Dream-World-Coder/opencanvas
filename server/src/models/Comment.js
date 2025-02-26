// Comments.js (for future implementation)
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
