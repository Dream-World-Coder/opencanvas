// Cron job: Delete media items from Imgur in batches
// Processes the mediaDeletionQueue model and removes old entries

const MediaDeletionQueue = require("../models/MediaDeletionQueue");
const BATCH_SIZE = 10; // Process 10 items at a time

async function processMediaDeletionQueue() {
  console.log("Starting media cleanup job...");

  const queue = await MediaDeletionQueue.findOne({});
  if (!queue || !queue.deletehashes || queue.deletehashes.length === 0) {
    console.log("No items in deletion queue.");
    return;
  }

  // Process first batch
  const batch = queue.deletehashes.slice(0, BATCH_SIZE);
  const remaining = queue.deletehashes.slice(BATCH_SIZE);

  console.log(`Processing ${batch.length} items from queue...`);

  // Delete from Imgur (client-side deletion using deletehash)
  for (const item of batch) {
    try {
      await fetch(`https://api.imgur.com/3/image/${item.deleteHash}`, {
        method: "DELETE",
      });
      console.log(`Deleted: ${item.deleteHash}`);
    } catch (err) {
      console.error(`Failed to delete ${item.deleteHash}:`, err.message);
    }
  }

  // Update queue with remaining items
  if (remaining.length === 0) {
    await MediaDeletionQueue.deleteOne({ _id: queue._id });
    console.log("Queue cleared.");
  } else {
    await MediaDeletionQueue.updateOne(
      { _id: queue._id },
      { $set: { deletehashes: remaining } }
    );
    console.log(`Remaining items in queue: ${remaining.length}`);
  }

  console.log("Media cleanup job completed.");
}

// Run if executed directly
if (require.main === module) {
  const mongoose = require("mongoose");
  require("dotenv").config();

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => processMediaDeletionQueue())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Cleanup failed:", err);
      process.exit(1);
    });
}

module.exports = processMediaDeletionQueue;
