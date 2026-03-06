const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: { type: String, required: true, maxlength: 1000 },

    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // mx 1 lv
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true, // faster look ups
    },

    // snapshot to cuz i dont want population
    authorSnapshot: {
      username: String,
      profilePicture: String,
    },

    stats: {
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 }, // Sub-comments count
    },
  },
  { timestamps: true },
);

// indexes
commentSchema.index({ postId: 1, parentId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
