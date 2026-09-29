import express from "express";
import { paymentWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Mobile Money payment results
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Record a Mobile Money payment result (called by the provider)
 *     description: Requires the X-Webhook-Secret header to match PAYMENTS_WEBHOOK_SECRET. A successful first payment activates the subscription; a failed one marks it failed.
 *     tags: [Payments]
 *     parameters:
 *       - in: header
 *         name: X-Webhook-Secret
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId, status]
 *             properties:
 *               paymentId: { type: string }
 *               status: { type: string, enum: [successful, failed] }
 *               reference: { type: string, description: Provider transaction id }
 *     responses:
 *       200:
 *         description: Payment settled (or already settled)
 *       400:
 *         description: Invalid body
 *       401:
 *         description: Invalid webhook secret
 *       404:
 *         description: Payment not found
 */
router.post("/webhook", paymentWebhook);

export default router;
