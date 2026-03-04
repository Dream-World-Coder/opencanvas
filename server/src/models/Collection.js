const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    thumbnailUrl: { type: String, trim: true },
    isPrivate: { type: Boolean, default: false },

    tags: {
      type: [String],
      trim: true,
      validate: [(val) => val.length <= 5, "Maximum 5 tags allowed"],
    },

    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // 50 max list of posts in this collection
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    // STATS
    stats: {
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
