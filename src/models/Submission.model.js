import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: [
        "javascript", "typescript", "python", "cpp", "c", "java",
        "go", "rust", "kotlin", "csharp", "php", "ruby", "swift"
      ],
      required: true,
    },
    languageId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "wrong_answer", "runtime_error", "time_limit_exceeded", "compilation_error"],
      default: "pending",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    isWinningSubmission: {
      type: Boolean,
      default: false,
    },
    executionTime: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
