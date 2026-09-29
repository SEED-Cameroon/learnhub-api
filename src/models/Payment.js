import mongoose from "mongoose";

/**
 * One Mobile Money charge for a subscription. A subscription becomes
 * active when its first payment succeeds; tutor earnings are summed from
 * successful payments.
 */
const paymentSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: ["XAF"], default: "XAF" },
    provider: { type: String, enum: ["mtn", "orange"], required: true },
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
    // "test" payments are confirmed by LearnHub itself and move no real money.
    mode: { type: String, enum: ["test", "live"], required: true },
    // The provider's transaction id, once known.
    reference: { type: String, default: "" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ tutor: 1, status: 1, paidAt: -1 });
paymentSchema.index({ subscription: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
