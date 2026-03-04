const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaItemSchema = new Schema(
  {
    deleteHash: { type: String, required: true },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const mediaDeletionQueueSchema = new Schema(
  {
    deletehashes: [mediaItemSchema],
  },
  { timestamps: false },
);

module.exports = mongoose.model("MediaDeletionQueue", mediaDeletionQueueSchema);
