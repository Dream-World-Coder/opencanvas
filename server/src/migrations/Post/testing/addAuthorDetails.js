const mongoose = require("mongoose");
const Post = require("../../models/Post"); // Adjust path to your Post model
const User = require("../../models/User"); // Adjust path to your User model

async function migrateAuthorDetails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/opencanvas",
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    console.log("Connected to MongoDB");

    // Fetch all posts
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to migrate`);

    // Process each post
    for (const post of posts) {
      // Fetch the user by authorId
      const fetchedUser = await User.findById(post.authorId);
      if (!fetchedUser) {
        console.warn(`User not found for post ${post._id}, skipping...`);
        continue; // Skip if user doesn’t exist
      }

      // Update the post with embedded author details
      post.author = {
        name: fetchedUser.fullName,
        username: fetchedUser.username,
        profilePicture: fetchedUser.profilePicture || null, // Default to null if missing
        designation: fetchedUser.designation || null, // Default to null if missing
      };

      // Save the updated post
      await post.save();
    }

    console.log("Author details migrated successfully for all posts!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

migrateAuthorDetails().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
