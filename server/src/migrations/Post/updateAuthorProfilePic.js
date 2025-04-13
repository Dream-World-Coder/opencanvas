const mongoose = require("mongoose");
const User = require("../../models/User");
const Post = require("../../models/Post");

async function updateAuthorProfilePicture() {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas",
        );
        console.log("Connected to MongoDB");

        const posts = await Post.find({});
        console.log(`Found ${posts.length} posts to update`);

        for (const post of posts) {
            const authorId = post.authorId;
            const author = await User.findOne({ _id: authorId });
            post.author.profilePicture = author.profilePicture;
            await post.save();
        }

        console.log(
            "author profilepicture updated successfully for all posts.",
        );
    } catch (error) {
        console.error("Error during migration:", error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

updateAuthorProfilePicture().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
