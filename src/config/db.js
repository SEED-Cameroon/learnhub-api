import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Logs any connection error clearly but never crashes the process —
 * this allows the API (and its health endpoint) to keep running even
 * when no MongoDB instance is reachable (e.g. in a sandbox).
 *
 * @returns {Promise<void>}
 */
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

export default connectDB;
