import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { AppError } from "../middlewares/error.middleware.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};


export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;


    const profilePic = req.file ? `/uploads/${req.file.filename}` : "";


    const user = await User.create({
      username,
      email,
      password,
      profilePic
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
        wins: user.wins,
        losses: user.losses,
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
      },
    });
  } catch (error) {
    next(error);
  }
};