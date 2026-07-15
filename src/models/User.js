import mongoose from 'mongoose';

/**
 * Minimal example User schema — a structural placeholder for future
 * authentication work. Not wired to any route/controller yet.
 */
const userSchema = new mongoose.Schema(
  {
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
      default: 'user',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
