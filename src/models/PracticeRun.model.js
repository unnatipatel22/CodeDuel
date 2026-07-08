import mongoose from "mongoose";

const practiceRunSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    topic: { type: String, default: 'all' },
    timeTaken: { type: Number, required: true }, // seconds
    status: { type: String, enum: ['completed','abandoned','timeout'], default: 'completed' },
    linesWritten: { type: Number, default: 0 },
    language: { type: String },
  },
  { timestamps: true }
);

const PracticeRun = mongoose.model('PracticeRun', practiceRunSchema);
export default PracticeRun;
