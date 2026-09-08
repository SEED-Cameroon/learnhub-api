import express from "express";

import { auth } from "../middleware/auth.js";

import {
  followUser,
  unfollowUser,
} from "../controllers/follow.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Follows
 *   description: Follow and unfollow users
 */

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     description: Allows an authenticated user to follow another user.
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user to follow
 *         example: 64f123456789abcdef123456
 *     responses:
 *       201:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     follow:
 *                       type: object
 *                       properties:
 *                         follower:
 *                           type: string
 *                           example: 64f123456789abcdef123456
 *                         following:
 *                           type: string
 *                           example: 64f987654321abcdef654321
 *                 message:
 *                   type: string
 *                   example: User followed successfully
 *
 *       400:
 *         description: User attempted to follow themselves
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: You cannot follow yourself
 *
 *       401:
 *         description: Missing or invalid authentication token
 *
 *       404:
 *         description: User to follow was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *
 *       409:
 *         description: User is already being followed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User already followed
 *
 *       500:
 *         description: Server error
 */
router.post("/users/:id/follow", auth, followUser);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     description: Allows an authenticated user to remove an existing follow relationship.
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the user to unfollow
 *         example: 64f987654321abcdef654321
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User unfollowed successfully
 *
 *       401:
 *         description: Missing or invalid authentication token
 *
 *       404:
 *         description: Follow relationship not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Follow relationship not found
 *
 *       500:
 *         description: Server error
 */
router.delete("/users/:id/follow", auth, unfollowUser);

export default router;