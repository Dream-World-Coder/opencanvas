// a collection is like youtube playlist that can be made with anyones posts
/*
{
  "_id": ObjectId("60f6a2b4a2e8c2a123456789"),
  "username": "axbycz",
  "fullName": "Mr. axbycz",
  "email": "axbycz@example.com",
  "passwordHash": "$2b$10$KIX./t56W2exampleHashString",
  "profilePicture": "https://example.com/profiles/axbycz.jpg", // or give a default one at first
  "ipAddress": "203.0.113.42",
  "lastFiveLogin": [
    {
      "loginTime": ISODate("2025-02-26T10:00:00Z"),
      "deviceInfo": "Chrome on Windows 10"
    },
  ],
  "createdAt": ISODate("2025-02-20T08:15:00Z"),
  "noOfFollowers": 0,
  "noOfFollowing": 0,
  "totalLikes": 0,
  "savedPosts": [],
  "lovedPosts": [],
  "posts": [], // post _id s
  "collections": [], collection _id s
  "featuredItems": [] // upto 4 posts/collection _id can be featured
}
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
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
        profilePicture: {
            type: String,
            default: "https://example.com/defaults/profile.png",
        },
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
        noOfFollowers: {
            type: Number,
            default: 0,
        },
        noOfFollowing: {
            type: Number,
            default: 0,
        },
        totalLikes: {
            type: Number,
            default: 0,
        },
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        lovedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        collections: [
            {
                type: Schema.Types.ObjectId,
                ref: "Collection",
            },
        ],
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
    },
    { timestamps: true },
);

// Limit featured items to 4
userSchema.path("featuredItems").validate(function (value) {
    return value.length <= 4;
}, "Featured items cannot exceed 4");

const User = mongoose.model("User", userSchema);
module.exports = User;
