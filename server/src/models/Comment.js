const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// no nested comments

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
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
