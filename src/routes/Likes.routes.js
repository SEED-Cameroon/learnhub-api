import express from "express";

import { auth } from "../middleware/auth.js";

import {
  likeCourse,
  unlikeCourse,
} from "../controllers/Likes.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Course Likes
 *   description: Like and unlike courses
 */

/**
 * @swagger
 * /api/courses/{courseId}/like:
 *   post:
 *     summary: Like a course
 *     description: Allows an authenticated user to like a course. The course's likesCount is increased by one.
 *     tags: [Course Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the course
 *         example: 64f123456789abcdef123456
 *     responses:
 *       201:
 *         description: Course liked successfully
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
 *                     like:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: string
 *                           example: 64f123456789abcdef123456
 *                         course:
 *                           type: string
 *                           example: 64f987654321abcdef654321
 *                 message:
 *                   type: string
 *                   example: Course liked successfully
 *
 *       404:
 *         description: Course not found
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
 *                   example: Course not found
 *
 *       409:
 *         description: Course has already been liked by the authenticated user
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
 *                   example: Course already liked
 *
 *       401:
 *         description: Missing or invalid authentication token
 *
 *       500:
 *         description: Server error
 */
router.post("/courses/:courseId/like", auth, likeCourse);

/**
 * @swagger
 * /api/courses/{courseId}/like:
 *   delete:
 *     summary: Unlike a course
 *     description: Removes the authenticated user's like from a course and decreases the course's likesCount by one.
 *     tags: [Course Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the course
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Like removed successfully
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
 *                   example: Like removed successfully
 *
 *       404:
 *         description: Like was not found
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
 *                   example: Like not found
 *
 *       401:
 *         description: Missing or invalid authentication token
 *
 *       500:
 *         description: Server error
 */
router.delete("/courses/:courseId/like", auth, unlikeCourse);

export default router;