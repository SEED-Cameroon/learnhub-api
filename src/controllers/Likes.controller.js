import Like from "../models/Like.js";
import Course from "../models/Course.js";

export async function likeCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.sub;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const existingLike = await Like.findOne({
      user: userId,
      course: courseId,
    });

    if (existingLike) {
      return res.status(409).json({
        success: false,
        message: "Course already liked",
      });
    }

    const like = await Like.create({
      user: userId,
      course: courseId,
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { likesCount: 1 },
    });

    return res.status(201).json({
      success: true,
      data: { like },
      message: "Course liked successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function unlikeCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.sub;

    const result = await Like.deleteOne({
      user: userId,
      course: courseId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    await Course.findByIdAndUpdate(courseId, {
      $inc: { likesCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Like removed successfully",
    });
  } catch (error) {
    next(error);
  }
}