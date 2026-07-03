import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  getStats,
  listProblems, getProblem, createProblem, updateProblem, deleteProblem, toggleProblemActive,
  listUsers, getUser, toggleAdmin, deleteUser,
  listRooms, deleteRoom,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes are double-protected: JWT verify + isAdmin check
router.use(protect, requireAdmin);

/* Stats */
router.get("/stats", getStats);

/* Problems */
router.get("/problems", listProblems);
router.post("/problems", createProblem);
router.get("/problems/:id", getProblem);
router.put("/problems/:id", updateProblem);
router.delete("/problems/:id", deleteProblem);
router.patch("/problems/:id/toggle", toggleProblemActive);

/* Users */
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/toggle-admin", toggleAdmin);
router.delete("/users/:id", deleteUser);

/* Rooms */
router.get("/rooms", listRooms);
router.delete("/rooms/:id", deleteRoom);

export default router;
