const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    deleteHash: { type: String, required: true },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const mediaDeletionQueueSchema = new mongoose.Schema(
  {
    deletehashes: [mediaSchema],
  },
  { timestamps: false },
);

module.exports = mongoose.model("MediaDeletionQueue", mediaDeletionQueueSchema);
