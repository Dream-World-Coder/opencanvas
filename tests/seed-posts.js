const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Post = require("./models/Post"); // Update path to your Post model

const MONGO_URI = "mongodb://localhost:27017/opencanvas-new"; // Update if using Atlas
const TOTAL_POSTS = 50000;
const BATCH_SIZE = 5000;

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Generate 50 dummy authors to reuse
    const users = Array.from({ length: 50 }).map(() => ({
      _id: new mongoose.Types.ObjectId(),
      username: faker.internet.username(),
      fullName: faker.person.fullName(),
      profilePicture: faker.image.avatar(),
    }));

    let inserted = 0;

    for (let i = 0; i < TOTAL_POSTS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const title = faker.lorem.sentence();

        batch.push({
          title: title,
          content: faker.lorem.paragraphs(5),
          slug: faker.helpers.slugify(title).toLowerCase(),
          authorId: randomUser._id,
          authorSnapshot: {
            username: randomUser.username,
            profilePicture: randomUser.profilePicture,
            fullName: randomUser.fullName,
          },
          isPublic: true,
          type: faker.helpers.arrayElement(["research-paper", "article", "poem", "story", "book", "written"]),
          readTime: `${faker.number.int({ min: 1, max: 20 })} min`,
          tags: faker.helpers.arrayElements(["tech", "science", "coding", "history", "math", "art"], 3),
          stats: {
            viewsCount: faker.number.int({ min: 0, max: 5000 }),
            likesCount: faker.number.int({ min: 0, max: 500 }),
          },
          // Spread creation dates over the last 2 years for realistic sorting
          createdAt: faker.date.past({ years: 2 }),
        });
      }

      await Post.insertMany(batch);
      inserted += BATCH_SIZE;
      console.log(`Inserted ${inserted} / ${TOTAL_POSTS}`);
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedDB();
