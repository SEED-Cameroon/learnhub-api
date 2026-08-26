import Course from "../models/Course.js";

export async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, thumbnailUrl, previewVideoUrl } =
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
      status: "draft",
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
    const { category } = req.query;
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
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("tutor", "name avatarUrl")
        .sort({ createdAt: -1 })
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
    const course = await Course.findOne({
      _id: id,
      status: "published",
    }).populate("tutor", "name avatarUrl");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        course,
      },
      message: "Course retrieved successfully",
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
    await course.deleteOne();
    return res.status(200).json({
      success: true,
      data: null,
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}