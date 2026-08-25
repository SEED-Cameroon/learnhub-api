import express from "express";

import {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

import auth from "../middleware/auth.js";
import requireRole from "../middleware/role.js";

const router = express.Router();
router.get("/", listCourses);
router.get("/:id", getCourse);
router.post(
  "/",
  auth,
  requireRole("tutor"),
  createCourse
);
router.patch(
  "/:id",
  auth,
  requireRole("tutor"),
  updateCourse
);
router.delete(
  "/:id",
  auth,
  requireRole("tutor"),
  deleteCourse
);
export default router;