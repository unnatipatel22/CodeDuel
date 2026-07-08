import Problem from "../models/Problem.model.js";
import { AppError } from "../middlewares/error.middleware.js";


export const getAllProblems = async (req, res, next) => {
  try {
    const { difficulty } = req.query;
    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;

    const problems = await Problem.find(filter).select(
      "title difficulty tags examples constraints"
    );

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    next(error);
  }
};


export const getRandomProblem = async (req, res, next) => {
  try {
    const { difficulty, topic } = req.query;
    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    
    // Filter by topic/tag if provided
    if (topic) {
      filter.tags = { $in: [topic] };
    }

    const count = await Problem.countDocuments(filter);
    if (count === 0) return next(new AppError("No problems found with selected criteria", 404));

    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter).skip(random).select(
      "-testCases" 
    );

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};


export const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).select("-testCases");

    if (!problem) return next(new AppError("Problem not found", 404));

    res.status(200).json({ success: true, problem });
  } catch (error) {
    next(error);
  }
};


export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, problem });
  } catch (error) {
    next(error);
  }
};
