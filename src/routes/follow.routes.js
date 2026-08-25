import express from "express";

import { auth } from "../middleware/auth.js";

import {
  followUser,
  unfollowUser,
} from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/users/:id/follow", auth, followUser);

router.delete("/users/:id/follow", auth, unfollowUser);

export default router;