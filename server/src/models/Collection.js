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
            // add max 5 limit, default "regular", so 4 more possible
            {
                type: String,
                trim: true,
            },
        ],
        thumbnailUrl: {
            type: String,
            trim: true,
        },
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
        // collections will be promoted through tags similarities of insider posts, their own tags
        // & upvotes
        // ai based content scanning can be implemented also
        upvotes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
