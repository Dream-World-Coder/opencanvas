const Post = require("../models/Post");

const WEIGHTS = {
  views: 0.5,
  readCompletion: 2.5,
  shares: 4,
  likes: 2,
  dislikes: 1.5,
  randomBoost: 1,
  decay: 1.37,
};

/**
 * Returns the average age of a post in days,
 * using both createdAt and updatedAt to reward recently edited posts.
 */
function getAgeInDays(createdAt, updatedAt) {
  const now = Date.now();
  const msPerDay = 1000 * 60 * 60 * 24;
  const ageSinceCreated = (now - new Date(createdAt).getTime()) / msPerDay;
  const ageSinceUpdated = (now - new Date(updatedAt).getTime()) / msPerDay;
  return (ageSinceCreated + ageSinceUpdated) / 2;
}

/**
 * Recalculates anonymousEngagementScore for every post and bulk-writes
 * the results in one DB round-trip per batch.
 *
 * Score formula:
 *   (views×0.5 + reads×2.5 + shares×4 + likes×2 + 1 - dislikes×1.5)
 *   ─────────────────────────────────────────────────────────────────
 *                       (ageInDays + 2) ^ 1.37
 *
 * The +2 floor prevents division by near-zero for brand-new posts.
 * The decay exponent makes older posts naturally sink in the feed.
 */

async function updateDefaultEngagementScore() {
  console.log("Starting engagement score update...");

  const BATCH_SIZE = 1000;
  let bulkOps = [];
  let updatedCount = 0;

  // Use a cursor to stream posts instead of loading all into memory
  const cursor = Post.find({})
    .select("_id stats createdAt updatedAt")
    .lean()
    .cursor();

  for await (const post of cursor) {
    const s = post.stats ?? {};
    const age = getAgeInDays(post.createdAt, post.updatedAt);

    const rawScore =
      (s.viewsCount ?? 0) * WEIGHTS.views +
      (s.readsCount ?? 0) * WEIGHTS.readCompletion +
      (s.sharesCount ?? 0) * WEIGHTS.shares +
      (s.likesCount ?? 0) * WEIGHTS.likes +
      WEIGHTS.randomBoost -
      (s.dislikesCount ?? 0) * WEIGHTS.dislikes;

    const score = rawScore / Math.pow(age + 2, WEIGHTS.decay);

    bulkOps.push({
      updateOne: {
        filter: { _id: post._id },
        update: { $set: { anonymousEngagementScore: score } },
      },
    });

    // Execute bulk write when batch size is reached
    if (bulkOps.length >= BATCH_SIZE) {
      await Post.bulkWrite(bulkOps, { ordered: false });
      updatedCount += bulkOps.length;
      bulkOps = []; // Clear the batch array to free memory
    }
  }

  // Process any remaining operations in the final batch
  if (bulkOps.length > 0) {
    await Post.bulkWrite(bulkOps, { ordered: false });
    updatedCount += bulkOps.length;
  }

  console.log(`Done. Updated ${updatedCount} posts.`);
}

if (require.main === module) {
  const mongoose = require("mongoose");
  require("dotenv").config();

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => updateDefaultEngagementScore())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

module.exports = updateDefaultEngagementScore;
