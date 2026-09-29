import express from "express";

import {
  listTutors,
  getTutor,
  updateTutor,
  getMyStats,
  getMyEarnings,
} from "../controllers/tutor.controller.js";

import { auth } from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: Tutor discovery and profile management
 */

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     summary: List all tutors
 *     description: Returns all users with the tutor role. Tutors can optionally be filtered by subject.
 *     tags: [Tutors]
 *     parameters:
 *       - in: query
 *         name: subject
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter tutors by subject
 *         example: Mathematics
 *     responses:
 *       200:
 *         description: Tutors retrieved successfully
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
 *                     tutors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           avatarUrl:
 *                             type: string
 *                             example: https://example.com/avatar.jpg
 *                           bio:
 *                             type: string
 *                             example: Experienced mathematics tutor.
 *                           subjectTags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example:
 *                               - Mathematics
 *                               - Physics
 *                 message:
 *                   type: string
 *                   example: Tutors retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", listTutors);

/**
 * @swagger
 * /api/tutors/me/stats:
 *   get:
 *     summary: Totals for the signed-in tutor's studio overview
 *     description: Courses, likes, comments, followers, and active supporters with their monthly total in XAF.
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor stats
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only tutors have stats
 */
// Must stay above "/:id" so "me" isn't read as a tutor id.
router.get("/me/stats", auth, requireRole("tutor"), getMyStats);

/**
 * @swagger
 * /api/tutors/me/earnings:
 *   get:
 *     summary: The signed-in tutor's earnings, supporters and recent payments
 *     description: thisMonthXaf and lastMonthXaf sum successful payments. Payments made while PAYMENTS_MODE=test have mode "test" and move no real money.
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only tutors have earnings
 */
router.get("/me/earnings", auth, requireRole("tutor"), getMyEarnings);

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     summary: Get a tutor by ID
 *     description: Returns a tutor's profile together with their published courses.
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the tutor
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Tutor retrieved successfully
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
 *                     tutor:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         avatarUrl:
 *                           type: string
 *                           example: https://example.com/avatar.jpg
 *                         bio:
 *                           type: string
 *                           example: Experienced mathematics tutor.
 *                         subjectTags:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - Mathematics
 *                             - Physics
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: Introduction to Algebra
 *                           description:
 *                             type: string
 *                             example: Learn the fundamentals of algebra.
 *                           category:
 *                             type: string
 *                             example: Mathematics
 *                           price:
 *                             type: number
 *                             example: 5000
 *                           thumbnailUrl:
 *                             type: string
 *                             example: https://example.com/course.jpg
 *                           previewVideoUrl:
 *                             type: string
 *                             example: https://example.com/preview.mp4
 *                           likesCount:
 *                             type: number
 *                             example: 25
 *                           commentsCount:
 *                             type: number
 *                             example: 10
 *                 message:
 *                   type: string
 *                   example: Tutor retrieved successfully
 *       404:
 *         description: Tutor not found
 *       500:
 *         description: Server error
 */
router.get("/:id", optionalAuth, getTutor);

/**
 * @swagger
 * /api/tutors/{id}:
 *   patch:
 *     summary: Update tutor profile
 *     description: Updates the authenticated tutor's own profile. A tutor can only update their own profile.
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the tutor
 *         example: 64f123456789abcdef123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               bio:
 *                 type: string
 *                 example: Experienced mathematics tutor.
 *               subjectTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Mathematics
 *                   - Physics
 *     responses:
 *       200:
 *         description: Tutor profile updated successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Tutor can only edit their own profile
 *       404:
 *         description: Tutor not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", auth, updateTutor);

export default router;