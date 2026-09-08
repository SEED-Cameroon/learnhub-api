import Comment from "../models/Comment.js";
import Course from "../models/Course.js";

export async function createComment(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.sub;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const comment = await Comment.create({
      course: id,
      user: userId,
      text: text.trim(),
    });

    await Course.findByIdAndUpdate(id, {
      $inc: { commentsCount: 1 },
    });

    return res.status(201).json({
      success: true,
      data: {
        comment,
      },
      message: "Comment added successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function listComments(req, res, next) {
  try {
    const { id } = req.params;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ course: id })
        .populate("user", "name avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Comment.countDocuments({ course: id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Comments retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}