

const LEETCODE_PROBLEMS = [
  { id: "two-sum", title: "Two Sum", difficulty: "easy", tags: ["arrays", "hashing"], url: "https://leetcode.com/problems/two-sum/" },
  { id: "add-two-numbers", title: "Add Two Numbers", difficulty: "medium", tags: ["linked list"], url: "https://leetcode.com/problems/add-two-numbers/" },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "medium", tags: ["sliding window", "strings", "hashing"], url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { id: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "hard", tags: ["binary search", "arrays"], url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "medium", tags: ["strings", "dynamic programming"], url: "https://leetcode.com/problems/longest-palindromic-substring/" },
  { id: "reverse-integer", title: "Reverse Integer", difficulty: "medium", tags: ["math"], url: "https://leetcode.com/problems/reverse-integer/" },
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "easy", tags: ["stack", "strings"], url: "https://leetcode.com/problems/valid-parentheses/" },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "easy", tags: ["linked list"], url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { id: "maximum-subarray", title: "Maximum Subarray", difficulty: "medium", tags: ["arrays", "dynamic programming"], url: "https://leetcode.com/problems/maximum-subarray/" },
  { id: "climbing-stairs", title: "Climbing Stairs", difficulty: "easy", tags: ["dynamic programming", "recursion"], url: "https://leetcode.com/problems/climbing-stairs/" },
  { id: "binary-tree-inorder-traversal", title: "Binary Tree Inorder Traversal", difficulty: "easy", tags: ["trees"], url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
  { id: "symmetric-tree", title: "Symmetric Tree", difficulty: "easy", tags: ["trees"], url: "https://leetcode.com/problems/symmetric-tree/" },
  { id: "single-number", title: "Single Number", difficulty: "easy", tags: ["bit manipulation", "arrays"], url: "https://leetcode.com/problems/single-number/" },
  { id: "number-of-islands", title: "Number of Islands", difficulty: "medium", tags: ["graphs"], url: "https://leetcode.com/problems/number-of-islands/" },
  { id: "coin-change", title: "Coin Change", difficulty: "medium", tags: ["dynamic programming"], url: "https://leetcode.com/problems/coin-change/" },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "medium", tags: ["arrays"], url: "https://leetcode.com/problems/product-of-array-except-self/" },
  { id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "medium", tags: ["binary search"], url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { id: "word-search", title: "Word Search", difficulty: "medium", tags: ["backtracking", "graphs"], url: "https://leetcode.com/problems/word-search/" },
  { id: "combination-sum", title: "Combination Sum", difficulty: "medium", tags: ["backtracking"], url: "https://leetcode.com/problems/combination-sum/" },
  { id: "jump-game", title: "Jump Game", difficulty: "medium", tags: ["greedy", "arrays"], url: "https://leetcode.com/problems/jump-game/" },
];

const leetcodeSource = {
  name: "leetcode",
  label: "LeetCode",
  isExternal: true,

  async fetchProblems({ difficulty, topic } = {}) {
    let problems = [...LEETCODE_PROBLEMS];
    if (difficulty && difficulty !== "all") {
      problems = problems.filter((p) => p.difficulty === difficulty.toLowerCase());
    }
    if (topic && topic !== "all") {
      const t = topic.toLowerCase().trim();
      problems = problems.filter((p) => p.tags.includes(t));
    }
    return problems;
  },

  async getRandomProblem({ difficulty, topic } = {}) {
    const filtered = await this.fetchProblems({ difficulty, topic });
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  },

  async fetchProblemById(id) {
    return LEETCODE_PROBLEMS.find((p) => p.id === id) || null;
  },

  async searchProblems(query = "", { difficulty, topic } = {}) {
    let problems = await this.fetchProblems({ difficulty, topic });
    if (query) {
      problems = problems.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    return { problems, total: problems.length, page: 1, limit: problems.length };
  },
};

export default leetcodeSource;
