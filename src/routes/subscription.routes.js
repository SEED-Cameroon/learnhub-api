import express from "express";

import { auth } from "../middleware/auth.js";

import {
  createSubscription,
  listMySubscriptions,
  getSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Student subscriptions to tutors
 */

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Subscribe to a tutor
 *     description: Allows an authenticated student to create a subscription to a tutor.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutorId, amount, provider, phoneNumber]
 *             properties:
 *               tutorId:
 *                 type: string
 *                 example: 64f123456789abcdef123456
 *               amount:
 *                 type: number
 *                 example: 5000
 *               provider:
 *                 type: string
 *                 enum: [mtn, orange]
 *                 example: mtn
 *               phoneNumber:
 *                 type: string
 *                 example: "677123456"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Missing required fields, or attempted to subscribe to self
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Tutor not found
 *       409:
 *         description: An active or pending subscription to this tutor already exists
 *       500:
 *         description: Server error
 */
router.post("/subscriptions", auth, createSubscription);

/**
 * @swagger
 * /api/subscriptions/me:
 *   get:
 *     summary: List my subscriptions
 *     description: Returns all subscriptions created by the authenticated student.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       500:
 *         description: Server error
 */
router.get("/subscriptions/me", auth, listMySubscriptions);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get a subscription
 *     description: Returns a single subscription. Accessible only to the student or tutor on the subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the subscription
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: User is not a participant on this subscription
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Server error
 */
router.get("/subscriptions/:id", auth, getSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a subscription
 *     description: Allows the subscribing student to cancel an active or pending subscription.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the subscription
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Only the subscriber can cancel this subscription
 *       404:
 *         description: Subscription not found
 *       409:
 *         description: Subscription is already cancelled
 *       500:
 *         description: Server error
 */
router.patch("/subscriptions/:id/cancel", auth, cancelSubscription);

export default router;
