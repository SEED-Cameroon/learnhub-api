import express from "express";

import { auth } from "../middleware/auth.js";

import {
  likeCourse,
  unlikeCourse,
} from "../controllers/Likes.controller.js";

const router = express.Router();

router.post("/courses/:courseId/like", auth, likeCourse);

router.delete("/courses/:courseId/like", auth, unlikeCourse);

export default router;