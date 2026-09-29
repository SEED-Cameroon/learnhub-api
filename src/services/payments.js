import crypto from "node:crypto";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";

/**
 * Mobile Money payments.
 *
 * PAYMENTS_MODE=test (the default until provider keys exist): LearnHub
 * confirms each payment itself after PAYMENTS_TEST_DELAY_MS, so the whole
 * pending -> active flow can be used without moving real money.
 *
 * PAYMENTS_MODE=live: the provider integration sends the payment prompt and
 * later calls POST /api/payments/webhook, which calls settlePayment().
 * The MTN MoMo / Orange Money request itself is not implemented yet.
 */
export const PAYMENTS_MODE = process.env.PAYMENTS_MODE === "live" ? "live" : "test";
const TEST_DELAY_MS = Number(process.env.PAYMENTS_TEST_DELAY_MS) || 8000;

const addMonth = (date) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

/**
 * Starts the first charge for a new subscription. Returns the pending payment.
 */
export async function requestPayment(subscription) {
  const payment = await Payment.create({
    subscription: subscription._id,
    student: subscription.student,
    tutor: subscription.tutor,
    amount: subscription.amount,
    provider: subscription.provider,
    mode: PAYMENTS_MODE,
  });

  if (PAYMENTS_MODE === "test") {
    // Stands in for the provider's webhook arriving after the student approves on their phone.
    setTimeout(() => {
      settlePayment(payment._id, { status: "successful", reference: `TEST-${payment._id}` }).catch((err) =>
        console.error("Test payment settlement failed:", err.message)
      );
    }, TEST_DELAY_MS).unref();
  } else {
    console.warn("PAYMENTS_MODE=live but no provider integration exists yet; payment", payment._id, "stays pending.");
  }

  return payment;
}

/**
 * Records the provider's result for a payment and updates its subscription.
 * Idempotent: a payment that is no longer pending is left alone.
 */
export async function settlePayment(paymentId, { status, reference = "" }) {
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    { status, reference, paidAt: status === "successful" ? new Date() : null },
    { new: true }
  );
  if (!payment) return null;

  const subscription = await Subscription.findById(payment.subscription);
  // A subscription cancelled while its payment was pending stays cancelled.
  if (subscription && subscription.status === "pending") {
    if (status === "successful") {
      subscription.status = "active";
      subscription.startedAt = payment.paidAt;
      subscription.nextBillingDate = addMonth(payment.paidAt);
    } else {
      subscription.status = "failed";
    }
    await subscription.save();
  }
  return payment;
}

/**
 * Test mode only: payments left pending by a server restart are settled on
 * startup, so nothing is stuck waiting for a timer that no longer exists.
 */
export async function settleStaleTestPayments() {
  if (PAYMENTS_MODE !== "test") return;
  const stale = await Payment.find({
    mode: "test",
    status: "pending",
    createdAt: { $lt: new Date(Date.now() - TEST_DELAY_MS) },
  }).select("_id");
  for (const { _id } of stale) {
    await settlePayment(_id, { status: "successful", reference: `TEST-${_id}` });
  }
}

/** Constant-time comparison for the webhook shared secret. */
export function isValidWebhookSecret(received) {
  const expected = process.env.PAYMENTS_WEBHOOK_SECRET;
  if (!expected || typeof received !== "string") return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
