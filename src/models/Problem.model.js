import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    tags: [{ type: String }],
    testCases: [testCaseSchema],
    // Multi-language starter codes
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      cpp: { type: String, default: "" },
      c: { type: String, default: "" },
      java: { type: String, default: "" },
      typescript: { type: String, default: "" },
      go: { type: String, default: "" },
      rust: { type: String, default: "" },
      kotlin: { type: String, default: "" },
      csharp: { type: String, default: "" },
      php: { type: String, default: "" },
      ruby: { type: String, default: "" },
      swift: { type: String, default: "" },
    },
    constraints: { type: String, default: "" },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    // Problem source: internal DB or external platform
    source: {
      type: String,
      enum: ["internal", "leetcode", "codingninjas", "gfg", "hackerrank", "codeforces"],
      default: "internal",
    },
    // ID on the external platform (e.g., LeetCode slug)
    externalId: {
      type: String,
      default: "",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient filtering by topic/difficulty/source
problemSchema.index({ tags: 1, difficulty: 1, source: 1, isActive: 1 });
problemSchema.index({ title: "text" });

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
