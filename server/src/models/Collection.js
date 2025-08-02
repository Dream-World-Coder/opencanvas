const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    tags: [
      // add max 5 limit, default "regular", so 4 more possible
      {
        type: String,
        trim: true,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    // collections will be promoted through tags similarities of insider posts, their own tags
    // & totalLikes
    // ai based content scanning can be implemented also
    totalLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
