const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactInfoSchema = new Schema(
  {
    title: { type: String, required: true, default: "OpenCanvas" },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const followerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    since: { type: Date, default: Date.now },
  },
  { _id: false },
);
const featureItemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      refPath: "featuredItems.itemType",
    },
    itemType: {
      type: String,
      enum: ["Post", "Collection"],
    },
    itemTitle: { type: String },
    itemThumbnail: { type: String },
  },
  { _id: false },
);

const lastLoginsSchema = new Schema(
  {
    loginTime: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  { _id: true },
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
    },
    fullName: {
      type: String,
      required: false,
      trim: true,
      minlength: [4, "Fullname must be at least 4 characters long"],
      maxlength: [32, "Fullname can be 32 characters long at max"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      enum: ["google", "opencanvas"],
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://opencanvas.blog/defaults/profile.jpeg",
    },
    // <<<<>>>>
    // its not traditional role, i have used 'relationship' for that, its users job description
    role: {
      type: String,
      default: "user",
      maxlength: [32, "Role can be 32 characters or less"],
    },
    relationship: {
      type: String,
      enum: ["user", "moderator", "admin"],
      // moderator -> bot
      // admin -> for user admin
      default: "user",
    },
    aboutMe: {
      type: String,
      default: "",
      maxlength: [300, "Bio must be 300 characters or less"],
    },
    premiumUser: {
      isPremium: { type: Boolean, default: false },
      subscriptionType: {
        type: String,
        enum: ["none", "basic", "pro", "premium"],
        default: "none",
      },
      subscriptionStartDate: { type: Date },
      subscriptionEndDate: { type: Date },
    },
    interestedIn: {
      // max 8, default: "any",
      type: [String],
      trim: true,
      default: ["any"],
      required: true,
      validate: {
        validator: function (interestedIn) {
          return interestedIn.length <= 8;
        },
        message: "Maximum 8 topics are allowed.",
      },
    },
    // <<<<>>>>
    lastFiveLogin: [lastLoginsSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    contactInformation: [ContactInfoSchema],
    notifications: {
      // type
      emailNotification: { type: Boolean, default: true },
      pushNotification: { type: Boolean, default: true },

      // category
      mentionNotification: { type: Boolean, default: true },
      followNotification: { type: Boolean, default: true },
      commentNotification: { type: Boolean, default: false },
      messageNotification: { type: Boolean, default: true },
      // its good but why no _id is created here? it is a document itself
    },
    // <<<<>>>>
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    // only an linear array will suffice because, user can create collections if needed to store similar type of rticles,
    // so no need to make this an array of object, like savedPosts.readLater etc
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    dislikedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    // no need to store posts, totalSavedPosts & totalLikedPosts just use .length,
    // cuz the array has to be loaded anyway, when we load currentUser
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    // featured post or collection, max 8 featured items
    featuredItems: [featureItemSchema],
    followers: [followerSchema],
    following: [followerSchema],
  },
  { timestamps: true },
);
userSchema.index({ username: 1, email: 1 });

// Limit featured items to 8
userSchema.path("featuredItems").validate(function (value) {
  return value.length <= 8;
}, "Featured items cannot exceed 8");

// Pre-save hook to set the default URL dynamically
userSchema.pre("save", function (next) {
  if (this.contactInformation.length === 0) {
    this.contactInformation.push({
      url: `https://www.opencanvas.blog/u/${this.username}`,
    });
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
