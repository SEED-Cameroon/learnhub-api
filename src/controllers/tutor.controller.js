import User from "../models/User.js";
import Course from "../models/Course.js";

export async function listTutors(req, res, next) {
  try {
    const { subject } = req.query;

    const filter = {
      role: "tutor",
    };

    if (subject) {
      filter.subjectTags = subject.trim();
    }

    const tutors = await User.find(filter)
      .select("name avatarUrl bio subjectTags")
      .sort({ createdAt: -1 });

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
    }).select("name email avatarUrl bio subjectTags");

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
        "title description category price thumbnailUrl previewVideoUrl likesCount commentsCount"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        tutor,
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
    } = req.body;

    if (name !== undefined) tutor.name = name;
    if (avatarUrl !== undefined) tutor.avatarUrl = avatarUrl;
    if (bio !== undefined) tutor.bio = bio;
    if (subjectTags !== undefined) tutor.subjectTags = subjectTags;

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
        },
      },
      message: "Tutor profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
}