import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export async function createSubscription(req, res, next) {
  try {
    const studentId = req.user.sub;
    const { tutorId, amount, provider, phoneNumber } = req.body;

    if (!tutorId || !amount || !provider || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "tutorId, amount, provider, and phoneNumber are required",
      });
    }

    if (tutorId === studentId) {
      return res.status(400).json({
        success: false,
        message: "You cannot subscribe to yourself",
      });
    }

    const tutor = await User.findOne({ _id: tutorId, role: "tutor" });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const existingSubscription = await Subscription.findOne({
      student: studentId,
      tutor: tutorId,
      status: { $in: ["pending", "active"] },
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: "You already have an active or pending subscription to this tutor",
      });
    }

    const subscription = await Subscription.create({
      student: studentId,
      tutor: tutorId,
      amount,
      provider,
      phoneNumber,
    });

    return res.status(201).json({
      success: true,
      data: {
        subscription,
      },
      message: "Subscription created successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function listMySubscriptions(req, res, next) {
  try {
    const studentId = req.user.sub;

    const subscriptions = await Subscription.find({ student: studentId })
      .populate("tutor", "name avatarUrl subjectTags")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        subscriptions,
      },
      message: "Subscriptions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const subscription = await Subscription.findById(id)
      .populate("tutor", "name avatarUrl subjectTags")
      .populate("student", "name avatarUrl");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const isParticipant =
      subscription.student._id.toString() === userId ||
      subscription.tutor._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this subscription",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        subscription,
      },
      message: "Subscription retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    const { id } = req.params;
    const studentId = req.user.sub;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.student.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Only the subscriber can cancel this subscription",
      });
    }

    if (subscription.status === "cancelled") {
      return res.status(409).json({
        success: false,
        message: "Subscription is already cancelled",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    return res.status(200).json({
      success: true,
      data: {
        subscription,
      },
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
}
