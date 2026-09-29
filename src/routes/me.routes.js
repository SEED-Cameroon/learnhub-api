import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getMe,
  updateMe,
  listFollowing,
  listLikedCourses,
} from "../controllers/me.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Me
 *   description: The signed-in user's own profile and lists
 */

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get the signed-in user's profile
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile
 *       401:
 *         description: Not authorized
 *   patch:
 *     summary: Update the signed-in user's profile or password
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Awa Ndzi }
 *               email: { type: string, example: awa@example.com }
 *               bio: { type: string }
 *               avatarUrl: { type: string }
 *               currentPassword: { type: string, description: Required with newPassword }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Updated profile
 *       400:
 *         description: Validation failed or current password is incorrect
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Email already in use
 */
router.get("/", auth, getMe);
router.patch("/", auth, updateMe);

/**
 * @swagger
 * /api/me/following:
 *   get:
 *     summary: Tutors the signed-in user follows
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Followed tutors with follower and course counts
 */
router.get("/following", auth, listFollowing);

/**
 * @swagger
 * /api/me/likes:
 *   get:
 *     summary: Published courses the signed-in user has liked
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liked courses, most recent first
 */
router.get("/likes", auth, listLikedCourses);

export default router;
