import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "./src/models/User.model.js";

await mongoose.connect(process.env.MONGO_URI);
const user = await User.findOne({ email: "unnati.patel2023@ssipmt.com" });
if (!user) {
  console.error("USER NOT FOUND");
  process.exit(1);
}
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
try {
  const res = await axios.post("http://localhost:5000/api/rooms/create", {
    mode: "practice",
    difficulty: "easy",
    topic: "arrays",
    timeLimit: 600,
    maxPlayers: 1,
    displayName: "TestUser"
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  console.log("SUCCESS", JSON.stringify(res.data, null, 2));
} catch (err) {
  if (err.response) {
    console.error("ERROR", err.response.status, JSON.stringify(err.response.data, null, 2));
  } else {
    console.error("ERROR", err.message);
  }
}
await mongoose.disconnect();
