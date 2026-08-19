import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      enum: ["XAF"],
      default: "XAF",
      required: true,
    },

    provider: {
      type: String,
      enum: ["mtn", "orange"],
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "failed", "cancelled"],
      default: "pending",
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    nextBillingDate: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ student: 1 });
subscriptionSchema.index({ tutor: 1 });

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

export default Subscription;