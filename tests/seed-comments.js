const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Comment = require("./models/Comment");
const User = require("./models/User");
const Post = require("./models/Post");

const MONGO_URI = "mongodb://127.0.0.1:27017/opencanvas_test";
const TOTAL_COMMENTS = 320000;
const BATCH_SIZE = 10000;
const POOL_SIZE = 1000;

async function seedComments() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Fetch subsets to prevent memory overload
    const [users, posts] = await Promise.all([
      User.find().select("_id username profilePicture").limit(10000).lean(),
      Post.find().select("_id").limit(10000).lean(),
    ]);

    if (users.length === 0 || posts.length === 0) {
      throw new Error("Missing users or posts. Run those seeders first.");
    }

    console.log("Generating comment pool...");
    const contentPool = Array.from({ length: POOL_SIZE }).map(() =>
      faker.lorem.sentences(2).substring(0, 1000),
    );

    let inserted = 0;

    for (let i = 0; i < TOTAL_COMMENTS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const u = users[Math.floor(Math.random() * users.length)];
        const p = posts[Math.floor(Math.random() * posts.length)];
        const text = contentPool[Math.floor(Math.random() * POOL_SIZE)];

        batch.push({
          content: text,
          authorId: u._id,
          postId: p._id,
          authorSnapshot: {
            username: u.username,
            profilePicture: u.profilePicture,
          },
          stats: {
            likesCount: Math.floor(Math.random() * 50),
            dislikesCount: Math.floor(Math.random() * 5),
          },
        });
      }

      await Comment.insertMany(batch, { ordered: false });
      inserted += BATCH_SIZE;
      console.log(`Inserted ${inserted} / ${TOTAL_COMMENTS}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedComments();
