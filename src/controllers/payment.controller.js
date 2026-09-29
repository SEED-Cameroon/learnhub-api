import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import { isValidWebhookSecret, settlePayment } from "../services/payments.js";

/**
 * POST /api/payments/webhook — called by the Mobile Money provider (or its
 * integration) with the result of a payment. Authenticated with the
 * X-Webhook-Secret header, which must equal PAYMENTS_WEBHOOK_SECRET.
 * Body: { paymentId, status: "successful" | "failed", reference }
 */
export async function paymentWebhook(req, res, next) {
  try {
    if (!isValidWebhookSecret(req.get("X-Webhook-Secret"))) {
      return res.status(401).json({ success: false, message: "Invalid webhook secret" });
    }

    const { paymentId, status, reference } = req.body;
    if (!mongoose.isValidObjectId(paymentId) || !["successful", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'paymentId and status ("successful" or "failed") are required',
      });
    }

    const payment = await settlePayment(paymentId, { status, reference: String(reference || "") });
    if (!payment) {
      // Unknown or already settled: acknowledge so the provider stops retrying.
      const exists = await Payment.exists({ _id: paymentId });
      return res.status(exists ? 200 : 404).json({
        success: Boolean(exists),
        message: exists ? "Payment already settled" : "Payment not found",
      });
    }

    return res.status(200).json({ success: true, data: { payment }, message: "Payment settled" });
  } catch (error) {
    next(error);
  }
}
