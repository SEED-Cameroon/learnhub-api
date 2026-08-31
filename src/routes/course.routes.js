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

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and discovery
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List published courses
 *     description: Returns published courses with optional category filtering and pagination.
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter courses by category
 *         example: Mathematics
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
 *         description: Number of courses per page
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f123456789abcdef123456
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
 *                           status:
 *                             type: string
 *                             example: published
 *                           tutor:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: John Doe
 *                               avatarUrl:
 *                                 type: string
 *                                 example: https://example.com/avatar.jpg
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
 *                           example: 25
 *                         pages:
 *                           type: integer
 *                           example: 3
 *                 message:
 *                   type: string
 *                   example: Courses retrieved successfully
 *
 *       500:
 *         description: Server error
 */
router.get("/", listCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a published course
 *     description: Returns a specific published course and its tutor information.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the course
 *         example: 64f123456789abcdef123456
 *
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
 *                     course:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: Course retrieved successfully
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
router.get("/:id", getCourse);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a course
 *     description: Creates a new course as a draft. Only authenticated tutors can create courses.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Algebra
 *               description:
 *                 type: string
 *                 example: Learn the fundamentals of algebra.
 *               category:
 *                 type: string
 *                 example: Mathematics
 *               price:
 *                 type: number
 *                 example: 5000
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/course.jpg
 *               previewVideoUrl:
 *                 type: string
 *                 example: https://example.com/preview.mp4
 *
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Required course information is missing
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
 *                   example: title, description, category and price are required
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: User does not have the tutor role
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  auth,
  requireRole("tutor"),
  createCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   patch:
 *     summary: Update a course
 *     description: Updates a course owned by the authenticated tutor.
 *     tags: [Courses]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Advanced Algebra
 *               description:
 *                 type: string
 *                 example: A more advanced algebra course.
 *               category:
 *                 type: string
 *                 example: Mathematics
 *               price:
 *                 type: number
 *                 example: 7500
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/new-thumbnail.jpg
 *               previewVideoUrl:
 *                 type: string
 *                 example: https://example.com/new-preview.mp4
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *                 example: published
 *
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Invalid course data
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
 *                   example: Status must be draft or published
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: User does not have the tutor role
 *       404:
 *         description: Course not found or course does not belong to the authenticated tutor
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  auth,
  requireRole("tutor"),
  updateCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     description: Deletes a course owned by the authenticated tutor.
 *     tags: [Courses]
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
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Course deleted successfully
 *
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: User does not have the tutor role
 *       404:
 *         description: Course not found or course does not belong to the authenticated tutor
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  auth,
  requireRole("tutor"),
  deleteCourse
);

export default router;