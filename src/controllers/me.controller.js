import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Like from "../models/Like.js";
import { withTutorCounts } from "./tutor.controller.js";

const PROFILE_FIELDS = "name email role avatarUrl bio subjectTags headline city createdAt";
const PASSWORD_MIN = 8;

const toProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  subjectTags: user.subjectTags,
  headline: user.headline,
  city: user.city,
  createdAt: user.createdAt,
});

/**
 * GET /api/me — the signed-in user's own profile.
 */
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select(PROFILE_FIELDS);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: { user: toProfile(user) },
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/me — update name, email, bio, avatarUrl, and optionally the
 * password (newPassword requires the correct currentPassword).
 */
export async function updateMe(req, res, next) {
  try {
    const { name, email, bio, avatarUrl, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ success: false, message: "Name can't be empty" });
      }
      user.name = String(name).trim();
    }

    if (email !== undefined && email !== user.email) {
      const nextEmail = String(email).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
        return res.status(400).json({ success: false, message: "Enter a valid email address" });
      }
      if (await User.exists({ email: nextEmail, _id: { $ne: user._id } })) {
        return res.status(409).json({ success: false, message: "That email is already in use" });
      }
      user.email = nextEmail;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    if (newPassword !== undefined) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      if (String(newPassword).length < PASSWORD_MIN) {
        return res.status(400).json({
          success: false,
          message: `New password must be at least ${PASSWORD_MIN} characters`,
        });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: { user: toProfile(user) },
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/me/following — tutors the signed-in user follows.
 */
export async function listFollowing(req, res, next) {
  try {
    const follows = await Follow.find({ follower: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: "following", select: "name avatarUrl bio subjectTags headline city role" });

    const tutors = await withTutorCounts(follows.map((f) => f.following).filter(Boolean));

    return res.status(200).json({
      success: true,
      data: { tutors: tutors.map((t) => ({ ...t, isFollowing: true })) },
      message: "Following retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/me/likes — published courses the signed-in user has liked.
 */
export async function listLikedCourses(req, res, next) {
  try {
    const likes = await Like.find({ user: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({
        path: "course",
        match: { status: "published" },
        populate: { path: "tutor", select: "name avatarUrl" },
      });

    return res.status(200).json({
      success: true,
      data: { courses: likes.map((l) => l.course).filter(Boolean) },
      message: "Liked courses retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}
