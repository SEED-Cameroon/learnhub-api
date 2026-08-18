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
    name: {
      type: String,
      required: true,
      trim: true,
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
