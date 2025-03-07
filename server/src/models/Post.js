/*
{
  // "media": update as soon as an image is inserted, at least in the localStorage, and later in the database
  // else would not find if any image is deleted while editing,
  // delete these in bulk when post is deleted [for less api calls to imgur],
  // [no need to delete on every post delete, store deleteHashes of multiple deleted posts in an array, then delete in bulk]
  "media": [{
      "url": "https://example.com/uploads/image1.jpg",
      "deleteHash": "abc"
    },],
}
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// the additional media uploaded, like images in a article
// no need to be unique
const mediaSchema = new Schema({
    url: { type: String, required: true },
    deleteHash: { type: String, required: true },
});

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
        thumbnailUrl: { type: String, default: "" },
        premiumPost: { type: Boolean, default: false }, // will be set by the user not me, if premium i will take some charge
        createdAt: { type: Date, default: Date.now },
        tags: {
            // max 5, default: "regular",
            // in images -> pre added tags,
            // in blog/articles custom tags can be added
            type: [String],
            trim: true,
            default: ["regular"],
            required: true,
            validate: {
                validator: function (tags) {
                    return tags.length <= 5;
                },
                message: "Maximum 5 tags are allowed.",
            },
        },
        postDeleteHash: {
            type: String,
            unique: true,
            required: true,
            // default: uuidv4, -> in the routes
        },
        isEdited: { type: Boolean, default: false },
        isPublic: { type: Boolean, default: true },
        type: {
            type: String,
            default: "written",
            enum: ["written", "article"],
        },

        media: [mediaSchema],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        totalComments: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 },
        totalLikes: { type: Number, default: 0 },
        totalSaves: { type: Number, default: 0 },
        totalShares: { type: Number, default: 0 },
    },
    { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
