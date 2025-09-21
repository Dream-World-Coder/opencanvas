// src/models/Collection.js

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
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    tags: [
      // max 5
      {
        type: String,
        trim: true,
        validate: {
          validator: function (tags) {
            return tags.length <= 5;
          },
          message: "Maximum 5 tags are allowed.",
        },
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
    // & upvote / downvote
    // ai based content scanning can be implemented also
    totalUpvotes: {
      type: Number,
      default: 0,
    },
    totalDownvotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
