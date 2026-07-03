import Problem from "../models/Problem.model.js";
import User from "../models/User.model.js";
import Room from "../models/Room.model.js";

/* ─────────────── DASHBOARD STATS ─────────────── */

export const getStats = async (req, res, next) => {
  try {
    const [totalProblems, activeProblems, totalUsers, adminUsers, totalRooms, liveRooms, finishedRooms] =
      await Promise.all([
        Problem.countDocuments(),
        Problem.countDocuments({ isActive: true }),
        User.countDocuments(),
        User.countDocuments({ isAdmin: true }),
        Room.countDocuments(),
        Room.countDocuments({ status: "live" }),
        Room.countDocuments({ status: "finished" }),
      ]);

    const topicAgg = await Problem.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const diffAgg = await Problem.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    const recentProblems = await Problem.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title difficulty isActive createdAt");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email wins totalMatches createdAt isAdmin");

    res.json({
      success: true,
      stats: {
        problems: { total: totalProblems, active: activeProblems, inactive: totalProblems - activeProblems },
        users: { total: totalUsers, admins: adminUsers },
        rooms: { total: totalRooms, live: liveRooms, finished: finishedRooms },
        byTopic: topicAgg,
        byDifficulty: diffAgg,
      },
      recentProblems,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────── PROBLEMS CRUD ─────────────── */

export const listProblems = async (req, res, next) => {
  try {
    const { search, difficulty, topic, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (difficulty && difficulty !== "all") query.difficulty = difficulty;
    if (topic && topic !== "all") query.tags = topic;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [problems, total] = await Promise.all([
      Problem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Problem.countDocuments(query),
    ]);

    res.json({ success: true, problems, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });
    res.json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, source: "internal" });
    res.status(201).json({ success: true, message: "Problem created!", problem });
  } catch (err) {
    next(err);
  }
};

export const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });
    res.json({ success: true, message: "Problem updated!", problem });
  } catch (err) {
    next(err);
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });
    res.json({ success: true, message: "Problem deleted!" });
  } catch (err) {
    next(err);
  }
};

export const toggleProblemActive = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });
    problem.isActive = !problem.isActive;
    await problem.save();
    res.json({ success: true, message: `Problem ${problem.isActive ? "enabled" : "disabled"}!`, isActive: problem.isActive });
  } catch (err) {
    next(err);
  }
};

/* ─────────────── USERS ─────────────── */

export const listUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = search ? { $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select("-password"),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const toggleAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot change your own admin status." });
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ success: true, message: `${user.username} is ${user.isAdmin ? "now an admin" : "no longer an admin"}.`, isAdmin: user.isAdmin });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    next(err);
  }
};

/* ─────────────── ROOMS ─────────────── */

export const listRooms = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [rooms, total] = await Promise.all([
      Room.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("problemId", "title difficulty")
        .populate("winnerId", "username"),
      Room.countDocuments(query),
    ]);
    res.json({ success: true, rooms, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Room deleted." });
  } catch (err) {
    next(err);
  }
};
