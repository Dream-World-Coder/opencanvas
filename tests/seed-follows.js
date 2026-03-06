const mongoose = require("mongoose");
const Follow = require("./models/Follow"); // Update path
const User = require("./models/User");

const MONGO_URI = "mongodb://127.0.0.1:27017/opencanvas_test";
const TOTAL_FOLLOWS = 100000;
const BATCH_SIZE = 10000;

async function seedFollows() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Fetch a subset of users
    const users = await User.find().select("_id").limit(10000).lean();

    if (users.length < 2) {
      throw new Error(
        "Not enough users to create follows. Run the users seeder first.",
      );
    }

    let inserted = 0;

    for (let i = 0; i < TOTAL_FOLLOWS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const follower = users[Math.floor(Math.random() * users.length)];
        let following = users[Math.floor(Math.random() * users.length)];

        // Ensure a user doesn't follow themselves
        while (follower._id.toString() === following._id.toString()) {
          following = users[Math.floor(Math.random() * users.length)];
        }

        batch.push({
          followerId: follower._id,
          followingId: following._id,
        });
      }

      // Catch ignores duplicate unique index errors silently
      await Follow.insertMany(batch, { ordered: false }).catch(() => {});
      inserted += BATCH_SIZE;
      console.log(`Processed ${inserted} / ${TOTAL_FOLLOWS}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedFollows();
