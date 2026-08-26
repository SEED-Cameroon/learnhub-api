import express from "express";

import {
  listTutors,
  getTutor,
  updateTutor,
} from "../controllers/tutor.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", listTutors);

router.get("/:id", getTutor);

router.patch("/:id", auth, updateTutor);

export default router;