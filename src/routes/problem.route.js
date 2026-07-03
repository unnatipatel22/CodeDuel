import { Router } from "express";
import {
  getAllProblems,
  getRandomProblem,
  getProblemById,
  createProblem,
} from "../controllers/problem.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAllProblems);
router.get("/random", getRandomProblem);
router.get("/:id", getProblemById);
router.post("/", protect, createProblem); 

export default router;
