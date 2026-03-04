const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    slug: { type: String, index: true }, // Store "my-cool-post" here

    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Denormalized for Feed Performance
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

    media: [{ type: String }], // Array of strings (URLs/Hashes)

    // SCALABLE STATS (Atomic Counters)
    stats: {
      viewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      readsCount: { type: Number, default: 0 }, // Total Complete Reads
    },

    anonymousEngagementScore: { type: Number },
    engagementScore: { type: Number },
  },
  { timestamps: true },
);

// Compound Indexes for Feed Generation
postSchema.index({ authorId: 1, isPublic: 1, createdAt: -1 });
postSchema.index({ tags: 1, isPublic: 1 }); // For Topic search

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
