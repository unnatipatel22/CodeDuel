import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/connect.js";
import { initSocket } from "./src/socket/socket.handler.js";
import { syncProblemsWithDB } from "./src/utils/problemFetcher.js";

import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import roomRoutes from "./src/routes/room.route.js";
import problemRoutes from "./src/routes/problem.route.js";
import submissionRoutes from "./src/routes/submission.route.js";
import leaderboardRoutes from "./src/routes/leaderboard.route.js";

import { errorHandler } from "./src/middlewares/error.middleware.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());


app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CodeDuel API is running 🚀" });
});

app.use(errorHandler);

initSocket(io);

const PORT = process.env.PORT || 5000;
console.log("PORT =", PORT);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ MongoDB connected`);
    console.log(`✅ Socket.io ready`);
    // Sync problems once at startup only — not on every request
    syncProblemsWithDB().catch((err) =>
      console.warn("⚠️ Problem sync skipped (network issue):", err.message)
    );
  });
});