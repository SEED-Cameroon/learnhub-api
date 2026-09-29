import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';

import healthRoutes from './src/routes/health.routes.js';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.routes.js';
import courseRoutes from "./src/routes/course.routes.js";
import likeRoutes from "./src/routes/Likes.routes.js";
import commentRoutes from "./src/routes/comment.routes.js";
import auth from "./src/middleware/auth.js";
import followRoutes from "./src/routes/follow.routes.js";
import subscriptionRoutes from "./src/routes/subscription.routes.js";
import tutorRoutes from "./src/routes/Tutor.routes.js";
import meRoutes from "./src/routes/me.routes.js";

const app = express();

// CORS_ORIGIN may list several origins separated by commas, e.g.
// "https://learnhub.vercel.app,https://www.learnhub.cm". Outside production
// the Vite dev server origins are allowed too.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:4173');
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/courses", commentRoutes);
app.use("/api/courses/:id/comments", auth, commentRoutes);
app.use("/api", followRoutes);
app.use("/api", subscriptionRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Kick off the DB connection without blocking server startup — connectDB()
// logs its own errors and never throws.
connectDB();

// Centralized error handler must be the last app.use().
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LearnHub API listening on port ${PORT}`);
});
