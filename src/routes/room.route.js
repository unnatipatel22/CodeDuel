import { Router } from "express";
import { createRoom, joinRoom, getRoomByCode, createRematch } from "../controllers/room.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.post("/rematch", protect, createRematch);
router.get("/:roomCode", protect, getRoomByCode);

export default router;
