import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { AppError } from "../middlewares/error.middleware.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const getDefaultAvatar = (username) => `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

export const register = async (req, res, next) => {
  try {
    const { username, email, password, bio, age, profession, yearOfStudy } = req.body;

    // If multer uploaded a profile picture, use it; otherwise use DiceBear avatar
    let profilePic = "";
    if (req.file) {
      profilePic = `/uploads/${req.file.filename}`;
    } else {
      profilePic = getDefaultAvatar(username);
    }

    const user = await User.create({
      username,
      email,
      password,
      profilePic,
      bio: bio || "",
      age: age ? Number(age) : null,
      profession: profession || null,
      yearOfStudy: profession === "student" ? (yearOfStudy || null) : null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
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


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
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


export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
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