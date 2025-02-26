/*
{
    "_id": ObjectId("60f6a2c8b2e8c2a123456780"),
    "title": "Understanding NoSQL for Modern Blogs",
    "authorId": ObjectId("60f6a2b4a2e8c2a123456789"),
    "tags": ["MongoDB", "NoSQL", "Blog"],
    "posts": [],
}
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            default: "",
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
