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

    // Flattened Threading Logic
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true, // Faster lookups for replies
    },

    // Optional: Snapshot to avoid population
    authorSnapshot: {
      username: String,
      profilePicture: String,
    },

    // SCALABLE STATS
    stats: {
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
      repliesCount: { type: Number, default: 0 }, // Sub-comments count
    },
  }, // Handles createdAt/updatedAt automatically
  { timestamps: true },
);

// Index to find all comments for a post, sorted by date
commentSchema.index({ postId: 1, parentId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
