import Submission from "../models/Submission.model.js";
import Room from "../models/Room.model.js";
import Problem from "../models/Problem.model.js";
import User from "../models/User.model.js";
import { runAllTestCases, LANGUAGE_IDS } from "../utils/judge0.js";
import { AppError } from "../middlewares/error.middleware.js";


export const submitCode = async (req, res, next) => {
  try {
    const { code, language, roomId } = req.body;

    
    const room = await Room.findById(roomId).populate("problemId");

    if (!room) return next(new AppError("Room not found", 404));
    if (room.status !== "live") return next(new AppError("Game is not active", 400));

    
    const player = room.players.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!player) return next(new AppError("You are not in this room", 403));

    if (player.hasSubmitted) {
      return next(new AppError("You have already submitted for this game", 400));
    }

    const problem = room.problemId;
    const languageId = LANGUAGE_IDS[language];

    
    const executionResult = await runAllTestCases(code, language, problem.testCases);

    
    const submission = await Submission.create({
      userId: req.user._id,
      roomId: room._id,
      problemId: problem._id,
      code,
      language,
      languageId,
      status: executionResult.allPassed ? "accepted" : "wrong_answer",
      testCasesPassed: executionResult.passed,
      totalTestCases: executionResult.total,
    });

    
    player.hasSubmitted = true;
    player.submittedAt = new Date();
    await room.save();

    
    if (executionResult.allPassed) {
      submission.isWinningSubmission = true;
      await submission.save();

      
      room.status = "finished";
      room.winnerId = req.user._id;
      room.finishedAt = new Date();
      await room.save();

      
      for (const p of room.players) {
        if (p.userId.toString() === req.user._id.toString()) {
          await User.findByIdAndUpdate(p.userId, {
            $inc: { wins: 1, totalMatches: 1 },
          });
        } else {
          await User.findByIdAndUpdate(p.userId, {
            $inc: { losses: 1, totalMatches: 1 },
          });
        }
      }

      req.io.to(room.roomCode).emit("game-over", {
        winnerId: req.user._id,
        winnerUsername: player.username,
        submission: {
          code: code,
          testCasesPassed: executionResult.passed,
          totalTestCases: executionResult.total,
        },
      });
    }

    res.status(200).json({
      success: true,
      result: {
        status: submission.status,
        testCasesPassed: executionResult.passed,
        totalTestCases: executionResult.total,
        allPassed: executionResult.allPassed,
        
        sampleResults: executionResult.results.slice(0, 2),
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getRoomSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ roomId: req.params.roomId })
      .populate("userId", "username")
      .select("-code"); 

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
};


export const runCode = async (req, res, next) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return next(new AppError("Code, language, and problemId are required", 400));
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return next(new AppError("Problem not found", 404));

    // Filter to run sample test cases if possible, otherwise run first 2 test cases
    let testCasesToRun = problem.testCases.filter((tc) => tc.isSample);
    if (testCasesToRun.length === 0) {
      testCasesToRun = problem.testCases.slice(0, 2);
    }

    const executionResult = await runAllTestCases(code, language, testCasesToRun);

    res.status(200).json({
      success: true,
      result: {
        testCasesPassed: executionResult.passed,
        totalTestCases: executionResult.total,
        allPassed: executionResult.allPassed,
        results: executionResult.results,
      },
    });
  } catch (error) {
    next(error);
  }
};
