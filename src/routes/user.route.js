import { Router } from "express";
import { getUserProfile, getMyStats, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.put("/me", protect, updateProfile);
router.get("/me/stats", protect, getMyStats);
router.get("/:id", getUserProfile);

export default router;
