/*
{
  "_id": ObjectId("60f6a2c8b2e8c2a123456780"),
  "title": "Understanding NoSQL for Modern Blogs",
  "content": "Long-form content goes here...",
  "authorId": ObjectId("60f6a2b4a2e8c2a123456789"),
  "createdAt": ISODate("2025-02-26T11:00:00Z"),
  "tags": ["MongoDB", "NoSQL", "Blog"],
  "postDeleteHash": "d3l3t3H45hEx4mpl3",

  "type": "article", // 'article', 'image'
  "imgUrl": "", // null if type is not 'image'
  "imgDeleteHash": "", // null if type is not 'image'

  // "media": update as soon as an image is inserted, at least in the localStorage, and later in the database
  // else would not find if any image is deleted while editing,
  // delete these in bulk when post is deleted [for less api calls to imgur],
  // [no need to delete on every post delete, store deleteHashes of multiple deleted posts in an array, then delete in bulk]
  "media": [
    {
      "url": "https://example.com/uploads/image1.jpg",
      "deleteHash": "abc"
    },
    {
      "url": "https://example.com/uploads/image2.jpg",
      "deleteHash": "def"
    }
  ],

  "comments": [], // comments _id, will implement comments later

  "totalViews": 0,
  "totalLoves": 0,
  "totalSaves": 0,
  "totalComments": 0,
  "totalShares": 0,
}
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    deleteHash: {
        type: String,
        required: true,
    },
});

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        postDeleteHash: {
            type: String,
        },
        type: {
            type: String,
            enum: ["article", "image"],
            default: "article",
        },
        imgUrl: {
            type: String,
            default: "",
        },
        imgDeleteHash: {
            type: String,
            default: "",
        },
        media: [mediaSchema],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        totalViews: {
            type: Number,
            default: 0,
        },
        totalLoves: {
            type: Number,
            default: 0,
        },
        totalSaves: {
            type: Number,
            default: 0,
        },
        totalComments: {
            type: Number,
            default: 0,
        },
        totalShares: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
