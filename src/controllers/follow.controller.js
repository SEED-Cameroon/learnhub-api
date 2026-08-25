import Follow from "../models/Follow.js";
import User from "../models/User.js";

export async function followUser(req, res, next) {
  try {
    const { id } = req.params;
    const followerId = req.user.sub;

    if (followerId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: id,
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "User already followed",
      });
    }

    const follow = await Follow.create({
      follower: followerId,
      following: id,
    });

    return res.status(201).json({
      success: true,
      data: {
        follow,
      },
      message: "User followed successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const { id } = req.params;
    const followerId = req.user.sub;

    const result = await Follow.deleteOne({
      follower: followerId,
      following: id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Follow relationship not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    next(error);
  }
}