import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One follow per (follower, following) pair. This used to index a
// non-existent `tutor` field, which made every user's second follow fail
// with a duplicate-key error.
followSchema.index(
  { follower: 1, following: 1 },
  { unique: true }
);

// Follower counts on tutor pages.
followSchema.index({ following: 1 });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;