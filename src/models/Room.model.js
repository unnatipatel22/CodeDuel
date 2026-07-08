import mongoose from "mongoose";

const SUPPORTED_LANGUAGES = ["javascript", "typescript", "python", "cpp", "c", "java", "go", "rust", "kotlin", "csharp", "php", "ruby", "swift"];
const SUPPORTED_TOPICS = [
  "all", "arrays", "binary search", "strings", "linked list", "trees",
  "graphs", "dynamic programming", "recursion", "greedy", "stack", "queue",
  "hashing", "sliding window", "two pointers", "math", "sorting",
  "bit manipulation", "backtracking"
];
const PROBLEM_SOURCES = ["internal", "leetcode", "codingninjas", "gfg", "hackerrank", "codeforces"];

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  username: { type: String },
  displayName: { type: String },
  socketId: { type: String },
  profilePic: { type: String, default: "" },
  isReady: { type: Boolean, default: false },
  hasSubmitted: { type: Boolean, default: false },
  submittedAt: { type: Date },
  isHost: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    players: [playerSchema],
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    // Problem selected by host before starting (can be internal or external)
    selectedProblemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mode: {
      type: String,
      enum: ["1v1", "multiplayer", "practice"],
      default: "1v1",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "all"],
      default: "all",
    },
    topic: {
      type: String,
      enum: SUPPORTED_TOPICS,
      default: "all",
    },
    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: "javascript",
    },
    problemSource: {
      type: String,
      enum: PROBLEM_SOURCES,
      default: "internal",
    },
    maxPlayers: {
      type: Number,
      default: 2,
      min: [1, "Room must allow at least 1 player"],
      max: [20, "Room can have at most 20 players"],
    },
    status: {
      type: String,
      enum: ["waiting", "live", "finished"],
      default: "waiting",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    timeLimit: { type: Number, default: 1800 },
  },
  { timestamps: true }
);

export { SUPPORTED_LANGUAGES, SUPPORTED_TOPICS, PROBLEM_SOURCES };
const Room = mongoose.model("Room", roomSchema);
export default Room;
