const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    contentPreview: {
      type: String,
      default: "",
      maxlength: 700,
    },
    slug: { type: String, index: true },

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // denormalized for feed perf
    authorSnapshot: {
      username: { type: String, required: true },
      profilePicture: { type: String },
      fullName: String,
    },

    thumbnailUrl: { type: String, default: "" },
    isPremium: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true, index: true },
    isEdited: { type: Boolean, default: false },

    type: {
      type: String,
      default: "written",
      enum: ["research-paper", "article", "poem", "story", "book", "written"],
    },

    readTime: {
      type: String,
      default: "",
      maxlength: [16, "Read time too long"],
    },

    tags: {
      type: [String],
      trim: true,
      default: [],
      validate: [(val) => val.length <= 5, "Maximum 5 tags allowed"],
    },

    media: [{ type: String }], // arr of strings (url or hashes)

    // stats (atomic ctns)
    stats: {
      viewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      readsCount: { type: Number, default: 0 }, // total full reads
    },

    anonymousEngagementScore: { type: Number },
    engagementScore: { type: Number },
  },
  { timestamps: true },
);

// indexes
postSchema.index({ authorId: 1, isPublic: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1, _id: -1 }); // for articles feed
// actually _id: -1 is needed for the tests only, else same createdAt is extremely rare unless millions of active users
postSchema.index({ tags: 1, isPublic: 1 }); // for topic srch

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
