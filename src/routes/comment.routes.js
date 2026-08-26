import express from "express";

import {
  listComments,
  createComment,
} from "../controllers/comment.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Course comment management
 */

/**
 * @swagger
 * /api/courses/{id}/comments:
 *   get:
 *     summary: List comments for a course
 *     description: Returns comments for a specific course with pagination. Comments are sorted from newest to oldest.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the course
 *         example: 64f123456789abcdef123456
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of comments per page
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f123456789abcdef123456
 *                           course:
 *                             type: string
 *                             example: 64f987654321abcdef654321
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: John Doe
 *                               avatarUrl:
 *                                 type: string
 *                                 example: https://example.com/avatar.jpg
 *                           text:
 *                             type: string
 *                             example: This course was very helpful!
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 35
 *                         pages:
 *                           type: integer
 *                           example: 4
 *                 message:
 *                   type: string
 *                   example: Comments retrieved successfully
 *
 *       500:
 *         description: Server error
 */
router.get("/:id/comments", listComments);

/**
 * @swagger
 * /api/courses/{id}/comments:
 *   post:
 *     summary: Add a comment to a course
 *     description: Creates a new comment on a course. Authentication is required.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the course
 *         example: 64f123456789abcdef123456
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The comment text
 *                 example: This course was very helpful!
 *
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                     comment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 64f123456789abcdef123456
 *                         course:
 *                           type: string
 *                           example: 64f987654321abcdef654321
 *                         user:
 *                           type: string
 *                           example: 64fabcd123456789abcdef12
 *                         text:
 *                           type: string
 *                           example: This course was very helpful!
 *                 message:
 *                   type: string
 *                   example: Comment added successfully
 *
 *       400:
 *         description: Comment text is missing or empty
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
 *                   example: Comment text is required
 *
 *       401:
 *         description: Missing or invalid authentication token
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
 *       500:
 *         description: Server error
 */
router.post("/:id/comments", auth, createComment);

export default router;