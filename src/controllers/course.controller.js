import Course from "../models/Course.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

const SORTS = {
  newest: { createdAt: -1 },
  liked: { likesCount: -1, createdAt: -1 },
};

// Escapes user text before it is used inside a search RegExp.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, thumbnailUrl, previewVideoUrl, status } =
      req.body;
    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "title, description, category and price are required",
      });
    }
    const course = await Course.create({
      tutor: req.user.sub,
      title,
      description,
      category,
      price,
      thumbnailUrl,
      previewVideoUrl,
      // Tutors can publish straight away or save a draft; anything else is a draft.
      status: status === "published" ? "published" : "draft",
    });
    return res.status(201).json({
      success: true,
      data: {
        course,
      },
      message: "Course created successfully",
    });
  } catch (error) {
    next(error);
  }
}
export async function listCourses(req, res, next) {
  try {
    const { category, q, sort } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );
    const filter = {
      status: "published",
    };
    if (category) {
      filter.category = category.trim();
    }

    if (q && q.trim()) {
      const pattern = new RegExp(escapeRegex(q.trim().slice(0, 100)), "i");
      filter.$or = [{ title: pattern }, { category: pattern }];
    }
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("tutor", "name avatarUrl")
        .sort(SORTS[sort] || SORTS.newest)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}
export async function getCourse(req, res, next) {
  try {
    const { id } = req.params;
    const viewerId = req.user?.sub;

    const course = await Course.findById(id).populate("tutor", "name avatarUrl");

    // Drafts are only visible to the tutor who owns them.
    const isOwner = viewerId && course && course.tutor?._id.toString() === viewerId;
    if (!course || (course.status !== "published" && !isOwner)) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const likedByMe = viewerId
      ? Boolean(await Like.exists({ course: id, user: viewerId }))
      : false;

    return res.status(200).json({
      success: true,
      data: {
        course,
        likedByMe,
      },
      message: "Course retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/courses/mine — every course the signed-in tutor owns, drafts included.
 */
export async function listMyCourses(req, res, next) {
  try {
    const courses = await Course.find({ tutor: req.user.sub }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        courses,
      },
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      price,
      thumbnailUrl,
      previewVideoUrl,
      status,
    } = req.body;
    const course = await Course.findOne({
      _id: id,
      tutor: req.user.sub,
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (price !== undefined) course.price = price;
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;
    if (previewVideoUrl !== undefined) {
      course.previewVideoUrl = previewVideoUrl;
    }
    if (status !== undefined) {
      if (!["draft", "published"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be draft or published",
        });
      }
      course.status = status;
    }
    await course.save();
    return res.status(200).json({
      success: true,
      data: {
        course,
      },
      message: "Course updated successfully",
    });
  } catch (error) {
    next(error);
  }
}
export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findOne({
      _id: id,
      tutor: req.user.sub,
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    await Promise.all([
      course.deleteOne(),
      Like.deleteMany({ course: id }),
      Comment.deleteMany({ course: id }),
    ]);
    return res.status(200).json({
      success: true,
      data: null,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}