const mongoose = require("mongoose");

require("dotenv").config();
const uri = process.env.ATLAS;

async function run() {
  await mongoose.connect(uri);
  const Post = mongoose.connection.collection("posts");
  const posts = await Post.find({}).toArray();

  for (const post of posts) {
    const preview = (post.content || "").slice(0, 700);

    await Post.updateOne(
      { _id: post._id },
      { $set: { contentPreview: preview } },
    );
  }

  console.log("contentPreview migration completed");
  await mongoose.disconnect();
}

run().catch(console.error);
