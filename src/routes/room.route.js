import { Router } from "express";
import { createRoom, joinRoom, getRoomByCode } from "../controllers/room.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get("/:roomCode", protect, getRoomByCode);

export default router;
