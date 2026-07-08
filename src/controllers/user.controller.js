import User from "../models/User.model.js";
import Submission from "../models/Submission.model.js";
import { AppError } from "../middlewares/error.middleware.js";


export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return next(new AppError("User not found", 404));

    
    const recentSubmissions = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("problemId", "title difficulty");

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        wins: user.wins,
        losses: user.losses,
        totalMatches: user.totalMatches,
        winRate: user.totalMatches > 0 ? Math.round((user.wins / user.totalMatches) * 100) : 0,
        createdAt: user.createdAt,
      },
      recentSubmissions,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const totalSubmissions = await Submission.countDocuments({ userId: user._id });
    const acceptedSubmissions = await Submission.countDocuments({
      userId: user._id,
      status: "accepted",
    });

    res.status(200).json({
      success: true,
      stats: {
        wins: user.wins,
        losses: user.losses,
        totalMatches: user.totalMatches,
        winRate: user.totalMatches > 0 ? Math.round((user.wins / user.totalMatches) * 100) : 0,
        totalSubmissions,
        acceptedSubmissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, age, profession, yearOfStudy } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return next(new AppError("User not found", 404));

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return next(new AppError("Username is already taken", 400));
      }
      user.username = username;
    }

    if (age) user.age = Number(age);
    if (profession) user.profession = profession;
    if (profession === "student" && yearOfStudy) {
      user.yearOfStudy = yearOfStudy;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        wins: user.wins,
        losses: user.losses,
        totalMatches: user.totalMatches,
        isAdmin: user.isAdmin,
        age: user.age,
        profession: user.profession,
        yearOfStudy: user.yearOfStudy,
      },
    });
  } catch (error) {
    next(error);
  }
};
