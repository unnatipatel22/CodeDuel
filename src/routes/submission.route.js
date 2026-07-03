import { Router } from "express";
import { submitCode, getRoomSubmissions, runCode } from "../controllers/submission.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateSubmission } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/", protect, validateSubmission, submitCode);
router.post("/run", protect, runCode);
router.get("/room/:roomId", protect, getRoomSubmissions);

export default router;
