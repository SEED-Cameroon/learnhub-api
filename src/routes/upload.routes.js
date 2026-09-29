import express from "express";
import { auth } from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import { receiveImage, receiveVideo, uploadImage, uploadVideo } from "../controllers/upload.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Image and video uploads (stored on Cloudinary)
 */

/**
 * @swagger
 * /api/uploads/image:
 *   post:
 *     summary: Upload an image (avatar, banner, course thumbnail)
 *     description: JPEG, PNG, WebP or GIF up to 2 MB. Returns the public URL to save on a profile or course.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Uploaded; data.url is the image URL
 *       400:
 *         description: No file sent
 *       413:
 *         description: File too large
 *       415:
 *         description: Unsupported file type
 */
router.post("/image", auth, receiveImage, uploadImage);

/**
 * @swagger
 * /api/uploads/video:
 *   post:
 *     summary: Upload a course preview video (tutors only)
 *     description: MP4, WebM or MOV up to 100 MB.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Uploaded; data.url is the video URL
 *       403:
 *         description: Only tutors can upload videos
 */
router.post("/video", auth, requireRole("tutor"), receiveVideo, uploadVideo);

export default router;
