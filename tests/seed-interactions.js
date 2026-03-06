const mongoose = require("mongoose");
const Interaction = require("./models/Interaction");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const MONGO_URI = "mongodb://127.0.0.1:27017/opencanvas_test";
const TOTAL_INTERACTIONS = 500000;
const BATCH_SIZE = 10000;

async function seedInteractions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Fetch subsets of IDs to prevent memory overload
    const [users, posts, comments] = await Promise.all([
      User.find().select("_id").limit(10000).lean(),
      Post.find().select("_id").limit(10000).lean(),
      Comment.find().select("_id").limit(10000).lean(),
    ]);

    if (!users.length || !posts.length || !comments.length) {
      throw new Error("Missing users, posts, or comments. Run prior seeders.");
    }

    const types = ["like", "dislike", "save"];
    const models = ["Post", "Comment"];
    let inserted = 0;

    for (let i = 0; i < TOTAL_INTERACTIONS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const u = users[Math.floor(Math.random() * users.length)];
        const targetModel = models[Math.floor(Math.random() * models.length)];

        // Select target ID based on the randomly chosen model
        const targetId =
          targetModel === "Post"
            ? posts[Math.floor(Math.random() * posts.length)]._id
            : comments[Math.floor(Math.random() * comments.length)]._id;

        batch.push({
          userId: u._id,
          targetId: targetId,
          targetModel: targetModel,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }

      // Catch ignores duplicate unique index errors silently
      await Interaction.insertMany(batch, { ordered: false }).catch(() => {});
      inserted += BATCH_SIZE;
      console.log(`Processed ${inserted} / ${TOTAL_INTERACTIONS}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedInteractions();
