import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health and status checks
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     description: Returns the current health status of the LearnHub API.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
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
 *                   example: LearnHub API is running
 *       500:
 *         description: Server error
 */
router.get('/', getHealth);

export default router;
