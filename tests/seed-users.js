const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./models/User");

const MONGO_URI = "mongodb://localhost:27017/opencanvas_test";
const TOTAL_USERS = 400000;
const BATCH_SIZE = 10000;

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    let inserted = 0;

    for (let i = 0; i < TOTAL_USERS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const index = i * BATCH_SIZE + j;
        const isDefault = Math.random() < 0.85; // 85% default data

        batch.push({
          username: `user_${index}`,
          email: `user${index}@example.com`,
          provider: "opencanvas",
          fullName: isDefault
            ? undefined
            : faker.person.fullName().substring(0, 32),
          role: "user",
          profilePicture: isDefault
            ? "https://opencanvas.in/defaults/profile.jpeg"
            : faker.image.avatar(),
          designation: isDefault
            ? "Learner"
            : faker.person.jobTitle().substring(0, 40),
          aboutMe: isDefault ? "" : faker.lorem.sentence().substring(0, 300),
        });
      }

      // ordered: false ensures speed and ignores random collision drops
      await User.insertMany(batch, { ordered: false });
      inserted += BATCH_SIZE;
      console.log(`Inserted ${inserted} / ${TOTAL_USERS}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedUsers();
