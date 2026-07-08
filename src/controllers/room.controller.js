import Room from "../models/Room.model.js";
import Problem from "../models/Problem.model.js";
import { getUniqueRoomCode } from "../utils/generateRoomCode.js";
import { AppError } from "../middlewares/error.middleware.js";
import { normalizeTopic } from "../utils/topic.utils.js";
import mongoose from 'mongoose';

export const selectProblemForRoom = async (difficulty, topic) => {
  const query = { isActive: true };
  if (difficulty && difficulty !== "all") {
    query.difficulty = difficulty.toLowerCase();
  }
  if (topic && topic !== "all") {
    const normalizedTopic = topic.toLowerCase().trim();
    query.tags = normalizedTopic;
  }

  const count = await Problem.countDocuments(query);
  if (count > 0) {
    const random = Math.floor(Math.random() * count);
    return await Problem.findOne(query).skip(random);
  }

  // Fallback 1: match difficulty only
  const queryDiffOnly = { isActive: true };
  if (difficulty && difficulty !== "all") {
    queryDiffOnly.difficulty = difficulty.toLowerCase();
  }
  const diffCount = await Problem.countDocuments(queryDiffOnly);
  if (diffCount > 0) {
    const random = Math.floor(Math.random() * diffCount);
    return await Problem.findOne(queryDiffOnly).skip(random);
  }

  // Fallback 2: any active problem
  const totalCount = await Problem.countDocuments({ isActive: true });
  if (totalCount > 0) {
    const random = Math.floor(Math.random() * totalCount);
    return await Problem.findOne({ isActive: true }).skip(random);
  }
  return null;
};

export const createRoom = async (req, res, next) => {
  try {
    const { mode, difficulty, topic, timeLimit, maxPlayers, displayName } = req.body;
    const normalizedTopic = normalizeTopic(topic);
    const roomCode = await getUniqueRoomCode();

    let problemId = null;
    let status = "waiting";
    let startedAt = null;

    if (mode === "practice") {
      status = "live";
      startedAt = new Date();
      const problem = await selectProblemForRoom(difficulty, normalizedTopic);
      if (problem) {
        problemId = problem._id;
      }
    }

    const username = displayName || req.user.username;

    const room = await Room.create({
      roomCode,
      creatorId: req.user._id,
      mode: mode || "1v1",
      difficulty: difficulty || "all",
      topic: normalizedTopic,
      maxPlayers: mode === "practice" ? 1 : (maxPlayers || 2),
      timeLimit: timeLimit || 1800,
      problemId,
      status,
      startedAt,
      players: [
        {
          userId: req.user._id,
          username,
          socketId: null,
          isReady: true, // Creator is ready by default
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: mode === "practice" ? "Practice arena created!" : "Room created! Share the code with your opponent.",
      room: {
        id: room._id,
        roomCode: room.roomCode,
        status: room.status,
        players: room.players,
        mode: room.mode,
        difficulty: room.difficulty,
        topic: room.topic,
        timeLimit: room.timeLimit,
        maxPlayers: room.maxPlayers,
        creatorId: room.creatorId,
        problemId: room.problemId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRematch = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) return next(new AppError('Invalid roomId', 400));
    const prev = await Room.findById(roomId).lean();
    if (!prev) return next(new AppError('Original room not found', 404));

    // Create a new room using same problem if available
    const roomCode = await getUniqueRoomCode();
    const newRoom = await Room.create({
      roomCode,
      creatorId: req.user._id,
      mode: prev.mode || '1v1',
      difficulty: prev.difficulty || 'all',
      topic: prev.topic || 'all',
      maxPlayers: prev.maxPlayers || 2,
      timeLimit: prev.timeLimit || 1800,
      problemId: prev.problemId || prev.selectedProblemId || null,
      status: 'waiting',
      players: [
        {
          userId: req.user._id,
          username: req.user.username,
          socketId: null,
          isReady: true,
        },
      ],
    });

    res.status(201).json({ success: true, room: {
      id: newRoom._id,
      roomCode: newRoom.roomCode,
      status: newRoom.status,
      players: newRoom.players,
      mode: newRoom.mode,
      difficulty: newRoom.difficulty,
      topic: newRoom.topic,
      timeLimit: newRoom.timeLimit,
      maxPlayers: newRoom.maxPlayers,
      creatorId: newRoom.creatorId,
      problemId: newRoom.problemId,
    }});
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { roomCode, displayName } = req.body;

    if (!roomCode) return next(new AppError("Room code is required", 400));

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) return next(new AppError("Room not found. Check the code!", 404));

    if (room.status !== "waiting") {
      return next(new AppError("Game already started or finished!", 400));
    }

    if (room.mode === "practice") {
      return next(new AppError("Cannot join a solo practice room!", 400));
    }

    if (room.players.length >= (room.maxPlayers || 2)) {
      return next(new AppError("Room is full!", 400));
    }

    const alreadyIn = room.players.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (alreadyIn) {
      return next(new AppError("You are already in this room!", 400));
    }

    const username = displayName || req.user.username;

    room.players.push({
      userId: req.user._id,
      username,
      socketId: null,
      isReady: false,
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: "Joined room successfully!",
      room: {
        id: room._id,
        roomCode: room.roomCode,
        status: room.status,
        players: room.players,
        mode: room.mode,
        difficulty: room.difficulty,
        topic: room.topic,
        timeLimit: room.timeLimit,
        maxPlayers: room.maxPlayers,
        creatorId: room.creatorId,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getRoomByCode = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    }).populate("problemId", "title description difficulty examples constraints starterCode");

    if (!room) return next(new AppError("Room not found", 404));

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};
