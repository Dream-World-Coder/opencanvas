const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Post = require("./models/Post");
const User = require("./models/User");

const MONGO_URI = "mongodb://127.0.0.1:27017/opencanvas_test";
const TOTAL_POSTS = 100000;
const BATCH_SIZE = 10000;
const POOL_SIZE = 1000;

async function seedPosts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Fetch users to assign as authors (limiting to 10k for memory efficiency)
    const users = await User.find()
      .select("_id username profilePicture fullName")
      .limit(10000)
      .lean();

    if (users.length === 0) {
      throw new Error(
        "No users found. Please run the users seed script first.",
      );
    }

    console.log("Generating content pool...");
    const contentPool = Array.from({ length: POOL_SIZE }).map(() => {
      const title = faker.lorem.sentence({ min: 3, max: 8 });
      return {
        title: title,
        slug:
          faker.helpers.slugify(title).toLowerCase() +
          "-" +
          faker.string.alphanumeric(5),
        content: faker.lorem.paragraphs(3),
        contentPreview: faker.lorem.paragraph(),
        tags: faker.helpers.arrayElements(
          ["tech", "science", "coding", "history", "math", "art"],
          3,
        ),
        type: faker.helpers.arrayElement([
          "research-paper",
          "article",
          "poem",
          "story",
          "book",
          "written",
        ]),
        readTime: `${faker.number.int({ min: 1, max: 20 })} min`,
        createdAt: faker.date.past({ years: 2 }),
      };
    });

    let inserted = 0;

    for (let i = 0; i < TOTAL_POSTS / BATCH_SIZE; i++) {
      const batch = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const u = users[Math.floor(Math.random() * users.length)];
        const c = contentPool[Math.floor(Math.random() * POOL_SIZE)];

        batch.push({
          ...c,
          authorId: u._id,
          authorSnapshot: {
            username: u.username,
            profilePicture: u.profilePicture,
            fullName: u.fullName,
          },
          isPublic: true,
          stats: {
            // Using standard Math.random for speed over Faker here
            viewsCount: Math.floor(Math.random() * 5000),
            likesCount: Math.floor(Math.random() * 500),
          },
        });
      }

      await Post.insertMany(batch, { ordered: false });
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

seedPosts();
