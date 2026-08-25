import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.index(
  { course: 1, user: 1 },
  { unique: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;