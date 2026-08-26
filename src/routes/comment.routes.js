import express from "express";

import {
  listComments,
  createComment,
} from "../controllers/comment.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:id/comments", listComments);

router.post("/:id/comments", auth, createComment);

export default router;