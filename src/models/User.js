import mongoose from 'mongoose';

/**
 * Minimal example User schema — a structural placeholder for future
 * authentication work. Not wired to any route/controller yet.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'tutor'],
      default: 'student',
    },
    avatarUrl: {
      type: String,
      default: ""
    },
     bio: {
      type: String,
      default: "",
      maxlength: 500
    },
    // Wide image across the top of the public tutor profile.
    bannerUrl: {
      type: String,
      default: "",
    },
    // Shown on the public tutor profile, e.g. "Advanced Mathematics".
    headline: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    city: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    subjectTags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
