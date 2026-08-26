import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import healthRoutes from './src/routes/health.routes.js';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import tutorRoutes from './src/routes/Tutor.routes.js';
import likeRoutes from './src/routes/Likes.routes.js';
import followRoutes from './src/routes/follow.routes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api', likeRoutes);
app.use('/api', followRoutes);

// Kick off the DB connection without blocking server startup — connectDB()
// logs its own errors and never throws.
connectDB();

// Centralized error handler must be the last app.use().
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LearnHub API listening on port ${PORT}`);
});
