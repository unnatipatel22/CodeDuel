import Problem from "../../models/Problem.model.js";

/**
 * Internal CodeDuel Problem Database Adapter
 * Uses our own MongoDB Problem collection as the source.
 */
const internalSource = {
  name: "internal",
  label: "CodeDuel Internal",
  isExternal: false,

  /**
   * Fetch problems with optional filters
   * @param {{ difficulty?: string, topic?: string }} filters
   * @returns {Promise<Problem[]>}
   */
  async fetchProblems({ difficulty, topic } = {}) {
    const query = { isActive: true, source: "internal" };
    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty.toLowerCase();
    }
    if (topic && topic !== "all") {
      query.tags = topic.toLowerCase().trim();
    }
    return Problem.find(query).select("title difficulty tags _id externalId").limit(50);
  },

  /**
   * Get a random problem matching filters
   */
  async getRandomProblem({ difficulty, topic } = {}) {
    const query = { isActive: true };
    if (difficulty && difficulty !== "all") query.difficulty = difficulty.toLowerCase();
    if (topic && topic !== "all") query.tags = topic.toLowerCase().trim();

    const count = await Problem.countDocuments(query);
    if (count > 0) {
      const random = Math.floor(Math.random() * count);
      return Problem.findOne(query).skip(random);
    }

    // Fallback: match difficulty only
    const diffQuery = { isActive: true };
    if (difficulty && difficulty !== "all") diffQuery.difficulty = difficulty.toLowerCase();
    const diffCount = await Problem.countDocuments(diffQuery);
    if (diffCount > 0) {
      const random = Math.floor(Math.random() * diffCount);
      return Problem.findOne(diffQuery).skip(random);
    }

    // Final fallback: any active problem
    const totalCount = await Problem.countDocuments({ isActive: true });
    if (totalCount > 0) {
      const random = Math.floor(Math.random() * totalCount);
      return Problem.findOne({ isActive: true }).skip(random);
    }
    return null;
  },

  /**
   * Fetch a problem by its MongoDB ID
   */
  async fetchProblemById(id) {
    return Problem.findById(id);
  },

  /**
   * Search problems by title, difficulty, or topic
   */
  async searchProblems(query = "", { difficulty, topic, page = 1, limit = 10 } = {}) {
    const filter = { isActive: true };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty.toLowerCase();
    if (topic && topic !== "all") filter.tags = topic.toLowerCase().trim();

    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select("title difficulty tags _id constraints")
        .skip(skip)
        .limit(limit)
        .sort({ difficulty: 1, title: 1 }),
      Problem.countDocuments(filter),
    ]);
    return { problems, total, page, limit };
  },
};

export default internalSource;
