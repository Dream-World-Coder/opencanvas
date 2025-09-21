const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-- the additional media uploaded, like images in an article
-- no need to be unique
-- needed only if i use imgur, else delete by _id
const mediaSchema = new Schema({
    url: { type: String, required: true },
    deleteHash: { type: String, required: true },
});
*/

// postDeleteHash: _id

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: { type: String, required: true },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // might not be required after populate
    author: {
      name: { type: String, required: true },
      profilePicture: { type: String },
    },
    thumbnailUrl: { type: String, default: "" },
    premiumPost: { type: Boolean, default: false }, // will be set by the user not me, if premium i will take some charge

    // createdAt given at default
    modifiedAt: { type: Date, default: Date.now },

    tags: {
      // max 5, default: none,
      // in images -> pre added tags,
      // in blog/articles custom tags can be added
      type: [String],
      trim: true,
      default: [],
      required: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 5;
        },
        message: "Maximum 5 tags are allowed.",
      },
    },
    isEdited: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    readTime: {
      type: String,
      default: "",
      maxlength: [16, "read time must be 16 characters or less"],
    },
    type: {
      type: String,
      default: "written",
      enum: ["written", "article", "poem", "story", "social"],
    },

    // array of deleteHash
    media: [{ type: String }],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    totalComments: { type: Number, default: 0 },

    totalViews: { type: Number, default: 0 },
    totalCompleteReads: { type: Number, default: 0 },

    viewedBy: [
      {
        identifier: String, // ID or fingerprint
        viewCount: { type: Number, default: 0 },
        lastViewed: { type: Date, default: Date.now },
      },
    ],

    totalLikes: { type: Number, default: 0 },
    // who liked can also be stored
    totalDislikes: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },

    anonymousEngageMentScore: { type: Number },
    engageMentScore: { type: Number },

    // isRepost:,
    // reposter: _id
  },
  { timestamps: true },
);
postSchema.index({ topics: 1, isPublic: 1, anonymousEngagementScore: -1 });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
