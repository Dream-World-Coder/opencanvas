const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactInfoSchema = new Schema(
  {
    title: { type: String, required: true, default: "OpenCanvas" },
    url: { type: String, required: true },
  },
  { _id: false },
);

const lastLoginsSchema = new Schema(
  {
    loginTime: { type: Date, default: Date.now },
    deviceInfo: { type: String },
    ipAddress: { type: String },
  },
  { _id: false },
);

const featureItemSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, refPath: "featuredItems.itemType" },
    itemType: { type: String, enum: ["Post", "Collection"] },
    itemTitle: { type: String },
    itemThumbnail: { type: String },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [4, "Username must be at least 4 characters long"],
      maxlength: [16, "Username can be 16 characters long at max"],
      match: [
        /^(?!\d+$)[a-z0-9_]+$/,
        "Username must contain only lowercase letters, numbers, or underscores.",
      ],
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
      minlength: [4, "Fullname must be at least 4 characters long"],
      maxlength: [32, "Fullname can be 32 characters long at max"],
    },

    // Auth & Role
    provider: { type: String, enum: ["google", "opencanvas"], required: true },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },

    // Profile Details
    profilePicture: {
      type: String,
      default: "https://opencanvas.in/defaults/profile.jpeg",
    },
    designation: { type: String, default: "Learner", maxlength: 40 },
    aboutMe: { type: String, default: "", maxlength: 300 },
    interestedIn: {
      type: [String],
      validate: [(val) => val.length <= 8, "Maximum 8 topics are allowed."],
      default: ["any"],
    },
    contactInformation: [ContactInfoSchema],

    // Premium
    premiumUser: {
      isPremium: { type: Boolean, default: false },
      subscriptionType: {
        type: String,
        enum: ["none", "basic", "pro", "premium"],
        default: "none",
      },
      subscriptionStartDate: Date,
      subscriptionEndDate: Date,
    },

    // storing counts here, actual data is in 'Follow' and 'Interaction' collections.
    stats: {
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      postsCount: { type: Number, default: 0 }, // Total posts created
      likesReceivedCount: { type: Number, default: 0 }, // likes on all posts
    },

    // limit to max 50
    collections: {
      type: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
      validate: [(val) => val.length <= 50, "Maximum 50 collections allowed"],
      default: [],
    },

    lastFiveLogin: [lastLoginsSchema],

    // Settings
    notifications: {
      emailNotification: { type: Boolean, default: true },
      pushNotification: { type: Boolean, default: true },
      mentionNotification: { type: Boolean, default: true },
      followNotification: { type: Boolean, default: true },
      commentNotification: { type: Boolean, default: false },
      messageNotification: { type: Boolean, default: true },
    },

    // small
    featuredItems: [featureItemSchema],
  },
  { timestamps: true },
);

userSchema.index({ username: 1, email: 1 });

userSchema.path("featuredItems").validate(function (value) {
  return value.length <= 8;
}, "Featured items cannot exceed 8");

// will do it with frontend only
// userSchema.pre("save", function (next) {
//   if (this.contactInformation && this.contactInformation.length === 0) {
//     this.contactInformation.push({
//       title: "OpenCanvas",
//       url: `https://www.opencanvas.in/u/${this.username}`,
//     });
//   }
//   next();
// });

const User = mongoose.model("User", userSchema);
module.exports = User;
