import mongoose from "mongoose";

// One lesson in the course outline. videoUrl may be an uploaded file
// (Cloudinary) or a YouTube link; videoCredit names the creator when the
// video is someone else's.
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  summary: { type: String, default: "", trim: true, maxlength: 600 },
  durationMin: { type: Number, default: 0, min: 0 },
  videoUrl: { type: String, default: "", trim: true },
  videoCredit: { type: String, default: "", trim: true, maxlength: 120 },
});

const courseSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Price must be an integer in FCFA",
      },
    },

    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },

    previewVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", ""],
      default: "",
    },
    // "What you'll learn" bullet points.
    outcomes: {
      type: [{ type: String, trim: true, maxlength: 200 }],
      default: [],
      validate: { validator: (v) => v.length <= 12, message: "Up to 12 outcomes" },
    },
    lessons: {
      type: [lessonSchema],
      default: [],
      validate: { validator: (v) => v.length <= 100, message: "Up to 100 lessons" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Counts opens of the course page by anyone other than its tutor.
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ tutor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;