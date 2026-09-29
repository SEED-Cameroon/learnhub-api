import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Follow from "../models/Follow.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";

const PUBLIC_FIELDS = "name avatarUrl bannerUrl bio subjectTags headline city";

/**
 * Adds followersCount and coursesCount (published) to a list of tutors,
 * with two grouped queries instead of one pair per tutor.
 */
export async function withTutorCounts(tutors) {
  const ids = tutors.map((t) => t._id);
  const [followers, courses] = await Promise.all([
    Follow.aggregate([{ $match: { following: { $in: ids } } }, { $group: { _id: "$following", n: { $sum: 1 } } }]),
    Course.aggregate([
      { $match: { tutor: { $in: ids }, status: "published" } },
      { $group: { _id: "$tutor", n: { $sum: 1 } } },
    ]),
  ]);
  const count = (rows) => new Map(rows.map((r) => [r._id.toString(), r.n]));
  const followerMap = count(followers);
  const courseMap = count(courses);

  return tutors.map((t) => ({
    ...t.toObject(),
    followersCount: followerMap.get(t._id.toString()) || 0,
    coursesCount: courseMap.get(t._id.toString()) || 0,
  }));
}

export async function listTutors(req, res, next) {
  try {
    const { subject } = req.query;

    const filter = {
      role: "tutor",
    };

    if (subject) {
      filter.subjectTags = subject.trim();
    }

    const tutors = await withTutorCounts(
      await User.find(filter).select(PUBLIC_FIELDS).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      data: {
        tutors,
      },
      message: "Tutors retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}
export async function getTutor(req, res, next) {
  try {
    const { id } = req.params;

    const tutor = await User.findOne({
      _id: id,
      role: "tutor",
    }).select(`${PUBLIC_FIELDS} email`);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const courses = await Course.find({
      tutor: id,
      status: "published",
    })
      .select(
        "title description category price thumbnailUrl previewVideoUrl status likesCount commentsCount viewsCount createdAt"
      )
      .sort({ createdAt: -1 });

    const viewerId = req.user?.sub;
    const [followersCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: id }),
      viewerId ? Follow.exists({ follower: viewerId, following: id }).then(Boolean) : false,
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tutor: {
          ...tutor.toObject(),
          followersCount,
          coursesCount: courses.length,
          isFollowing,
        },
        courses,
      },
      message: "Tutor retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}
export async function updateTutor(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.sub !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own tutor profile",
      });
    }

    const tutor = await User.findOne({
      _id: id,
      role: "tutor",
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const {
      name,
      avatarUrl,
      bio,
      subjectTags,
      headline,
      city,
      bannerUrl,
    } = req.body;

    if (name !== undefined) tutor.name = name;
    if (avatarUrl !== undefined) tutor.avatarUrl = avatarUrl;
    if (bio !== undefined) tutor.bio = bio;
    if (subjectTags !== undefined) tutor.subjectTags = subjectTags;
    if (headline !== undefined) tutor.headline = headline;
    if (city !== undefined) tutor.city = city;
    if (bannerUrl !== undefined) tutor.bannerUrl = bannerUrl;

    await tutor.save();

    return res.status(200).json({
      success: true,
      data: {
        tutor: {
          id: tutor._id,
          name: tutor.name,
          email: tutor.email,
          avatarUrl: tutor.avatarUrl,
          bio: tutor.bio,
          subjectTags: tutor.subjectTags,
          headline: tutor.headline,
          city: tutor.city,
          bannerUrl: tutor.bannerUrl,
        },
      },
      message: "Tutor profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
}
/**
 * GET /api/tutors/me/stats — totals for the tutor studio overview.
 * monthlySupportXaf sums active subscriptions only; pending ones are
 * waiting for the provider to confirm payment.
 */
export async function getMyStats(req, res, next) {
  try {
    const tutorId = req.user.sub;
    const courses = await Course.find({ tutor: tutorId }).select("status likesCount commentsCount viewsCount");

    const [followers, support] = await Promise.all([
      Follow.countDocuments({ following: tutorId }),
      Subscription.aggregate([
        // aggregate() does not cast strings, so the id is converted explicitly.
        { $match: { tutor: new mongoose.Types.ObjectId(tutorId), status: "active" } },
        { $group: { _id: null, supporters: { $sum: 1 }, amount: { $sum: "$amount" } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          courses: courses.length,
          published: courses.filter((c) => c.status === "published").length,
          likes: courses.reduce((sum, c) => sum + c.likesCount, 0),
          comments: courses.reduce((sum, c) => sum + c.commentsCount, 0),
          views: courses.reduce((sum, c) => sum + (c.viewsCount || 0), 0),
          followers,
          activeSupporters: support[0]?.supporters || 0,
          monthlySupportXaf: support[0]?.amount || 0,
        },
      },
      message: "Tutor stats retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tutors/me/earnings — money the signed-in tutor has received:
 * this month vs last month (successful payments), active supporters, and
 * the most recent payments. Test-mode payments are included and flagged.
 */
export async function getMyEarnings(req, res, next) {
  try {
    const tutor = new mongoose.Types.ObjectId(req.user.sub);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const sumBetween = async (from, to) => {
      const [row] = await Payment.aggregate([
        { $match: { tutor, status: "successful", paidAt: { $gte: from, $lt: to } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return row?.total || 0;
    };

    const [thisMonthXaf, lastMonthXaf, supporters, payments] = await Promise.all([
      sumBetween(monthStart, now),
      sumBetween(lastMonthStart, monthStart),
      Subscription.find({ tutor, status: "active" })
        .populate("student", "name avatarUrl")
        .sort({ startedAt: -1 })
        .limit(100),
      Payment.find({ tutor })
        .populate("student", "name avatarUrl")
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        thisMonthXaf,
        lastMonthXaf,
        activeSupporters: supporters.length,
        monthlySupportXaf: supporters.reduce((sum, s) => sum + s.amount, 0),
        supporters: supporters.map((s) => ({
          id: s._id,
          student: s.student,
          amount: s.amount,
          provider: s.provider,
          since: s.startedAt,
          paymentMode: s.paymentMode,
        })),
        payments: payments.map((p) => ({
          id: p._id,
          student: p.student,
          amount: p.amount,
          provider: p.provider,
          status: p.status,
          mode: p.mode,
          paidAt: p.paidAt,
          createdAt: p.createdAt,
        })),
      },
      message: "Earnings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}
