const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
    {
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: {
            regular: {
                type: String,
                default: "default",
            },
            max: {
                type: String,
            },
        },
        type: {
            type: String,
            default: "image",
            enum: ["image"],
        },
        imgUrl: {
            type: String,
            required: true,
        },
        imgDeleteHash: {
            type: String,
            required: true,
        },
        postDeleteHash: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Image", imageSchema);
