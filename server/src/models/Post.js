// Post module
const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "image", "image_with_description"],
            required: true,
        },
        content: {
            text: String,
            imageUrl: String,
            description: String,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        shareableLink: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);
