const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
        passwordHash: {
            type: String,
            required: true,
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
        role: {
            type: String,
            default: "user",
            enum: ["user", "admin", "moderator"],
            maxlength: [32, "Role can be 32 characters or less"],
        },
        aboutMe: {
            type: String,
            default: "",
            maxlength: [300, "Bio must be 300 characters or less"],
        },
        premiumUser: {
            type: Boolean,
            default: false,
            subscriptionType: {
                type: String,
                enum: ["none", "basic", "pro", "premium"],
                default: "none",
            },
            subscriptionStartDate: {
                type: Date,
            },
            subscriptionEndDate: {
                type: Date,
            },
        },
        // <<<<>>>>
        ipAddress: {
            type: String,
        },
        lastFiveLogin: [
            {
                loginTime: {
                    type: Date,
                    default: Date.now,
                },
                deviceInfo: {
                    type: String,
                },
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        // <<<<>>>>
        // total likes earned through all posts
        totalLikes: {
            type: Number,
            default: 0,
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        // totalPosts:{}, //not needed that much
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        totalSavedPosts: {
            type: Number,
            default: 0,
        },
        // no need to store loved/liked posts
        collections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Collection",
            },
        ],
        // featured post or collection, max 8 featured items
        featuredItems: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    refPath: "featuredItems.itemType",
                },
                itemType: {
                    type: String,
                    enum: ["Post", "Collection"],
                },
            },
        ],
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        totalFollowers: {
            type: Number,
            default: 0,
        },
        totalFollowing: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);
// Limit featured items to 8
userSchema.path("featuredItems").validate(function (value) {
    return value.length <= 8;
}, "Featured items cannot exceed 8");
const User = mongoose.model("User", userSchema);
module.exports = User;
