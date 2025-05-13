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
        // Field to indicate if this is a parent comment or a reply
        isReply: {
            type: Boolean,
            default: false,
        },
        // Reference to parent comment if this is a reply
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            // Only required if it's a reply
            required: function () {
                return this.isReply === true;
            },
        },
        // Array to store reply IDs for parent comments
        replies: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        modifiedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false },
);

// indexing
commentSchema.index({ postId: 1, parentId: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
