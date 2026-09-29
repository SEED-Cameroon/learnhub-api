import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Follow from "../models/Follow.js";
import Subscription from "../models/Subscription.js";

const PUBLIC_FIELDS = "name avatarUrl bio subjectTags headline city";

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
        "title description category price thumbnailUrl previewVideoUrl status likesCount commentsCount createdAt"
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
    } = req.body;

    if (name !== undefined) tutor.name = name;
    if (avatarUrl !== undefined) tutor.avatarUrl = avatarUrl;
    if (bio !== undefined) tutor.bio = bio;
    if (subjectTags !== undefined) tutor.subjectTags = subjectTags;
    if (headline !== undefined) tutor.headline = headline;
    if (city !== undefined) tutor.city = city;

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
    const courses = await Course.find({ tutor: tutorId }).select("status likesCount commentsCount");

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
