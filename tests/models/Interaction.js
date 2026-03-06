const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const interactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetModel: {
      type: String,
      required: true,
      enum: ["Post", "Collection", "Comment"],
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "dislike", "save"],
    },
  },
  { timestamps: true },
);

interactionSchema.index({ userId: 1, targetId: 1, type: 1 }, { unique: true });
interactionSchema.index({ targetId: 1, type: 1 });

const Interaction = mongoose.model("Interaction", interactionSchema);
module.exports = Interaction;
