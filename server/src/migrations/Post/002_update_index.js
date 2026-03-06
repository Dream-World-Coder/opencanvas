const mongoose = require("mongoose");

require("dotenv").config();
const uri = process.env.ATLAS;

async function run() {
  await mongoose.connect(uri);
  const Post = mongoose.connection.collection("posts");
  const indexes = await Post.indexes();
  console.log(indexes);
  await mongoose.disconnect();
}

run().catch(console.error);
