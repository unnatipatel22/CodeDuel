import axios from "axios";
import Problem from "../models/Problem.model.js";

const PUBLIC_PROBLEMS_URL = "https://raw.githubusercontent.com/social-apex/codeduel-problems/main/problems.json";

const fallbackProblems = [
  // ARRAYS
  {
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    tags: ["arrays", "hashmap"],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" }
    ],
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isSample: true },
      { input: "3 2 4\n6", expectedOutput: "1 2", isSample: false },
      { input: "3 3\n6", expectedOutput: "0 1", isSample: false }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n    // Write your code here\n}`,
      python: `def two_sum(nums, target):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    \n}`
    }
  },
  {
    title: "Contains Duplicate",
    description: "Given an integer array `nums`, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    difficulty: "easy",
    tags: ["arrays"],
    constraints: "1 <= nums.length <= 10^5",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" }
    ],
    testCases: [
      { input: "1 2 3 1", expectedOutput: "true", isSample: true },
      { input: "1 2 3 4", expectedOutput: "false", isSample: false }
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n    // Write your code here\n}`,
      python: `def contains_duplicate(nums):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nbool containsDuplicate(vector<int>& nums) {\n    \n}`
    }
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    difficulty: "medium",
    tags: ["arrays", "dynamic programming"],
    constraints: "1 <= nums.length <= 10^5",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6." }
    ],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isSample: true },
      { input: "5 4 -1 7 8", expectedOutput: "23", isSample: false }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n    // Write your code here\n}`,
      python: `def max_sub_array(nums):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n    \n}`
    }
  },

  // STRINGS
  {
    title: "Reverse a String",
    description: "Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "easy",
    tags: ["strings"],
    constraints: "1 <= s.length <= 10^5",
    examples: [
      { input: "s = ['h','e','l','l','o']", output: "['o','l','l','e','h']" }
    ],
    testCases: [
      { input: "hello", expectedOutput: "olleh", isSample: true },
      { input: "Hannah", expectedOutput: "hannaH", isSample: false }
    ],
    starterCode: {
      javascript: `function reverseString(s) {\n    // Write your code here\n}`,
      python: `def reverse_string(s):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nstring reverseString(string s) {\n    \n}`
    }
  },
  {
    title: "Valid Anagram",
    description: "Given two strings `s` and `t`, return true if `t` is an anagram of `s`, and false otherwise.",
    difficulty: "easy",
    tags: ["strings"],
    constraints: "1 <= s.length, t.length <= 5 * 10^4",
    examples: [
      { input: "s = 'anagram', t = 'nagaram'", output: "true" }
    ],
    testCases: [
      { input: "anagram\nnagaram", expectedOutput: "true", isSample: true },
      { input: "rat\ncar", expectedOutput: "false", isSample: false }
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {\n    // Write your code here\n}`,
      python: `def is_anagram(s, t):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nbool isAnagram(string s, string t) {\n    \n}`
    }
  },
  {
    title: "Longest Palindromic Substring",
    description: "Given a string `s`, return the longest palindromic substring in `s`.",
    difficulty: "medium",
    tags: ["strings", "dynamic programming"],
    constraints: "1 <= s.length <= 1000",
    examples: [
      { input: "s = 'babad'", output: "'bab'" }
    ],
    testCases: [
      { input: "babad", expectedOutput: "bab", isSample: true },
      { input: "cbbd", expectedOutput: "bb", isSample: false }
    ],
    starterCode: {
      javascript: `function longestPalindrome(s) {\n    // Write your code here\n}`,
      python: `def longest_palindrome(s):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nstring longestPalindrome(string s) {\n    \n}`
    }
  },

  // BINARY SEARCH
  {
    title: "Binary Search",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.",
    difficulty: "easy",
    tags: ["binary search"],
    constraints: "1 <= nums.length <= 10^4",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" }
    ],
    testCases: [
      { input: "-1 0 3 5 9 12\n9", expectedOutput: "4", isSample: true },
      { input: "-1 0 3 5 9 12\n2", expectedOutput: "-1", isSample: false }
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n    // Write your code here\n}`,
      python: `def search(nums, target):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint search(vector<int>& nums, int target) {\n    \n}`
    }
  },
  {
    title: "Search in Rotated Sorted Array",
    description: "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.",
    difficulty: "medium",
    tags: ["binary search"],
    constraints: "1 <= nums.length <= 5000",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }
    ],
    testCases: [
      { input: "4 5 6 7 0 1 2\n0", expectedOutput: "4", isSample: true },
      { input: "4 5 6 7 0 1 2\n3", expectedOutput: "-1", isSample: false }
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n    // Write your code here\n}`,
      python: `def search(nums, target):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint search(vector<int>& nums, int target) {\n    \n}`
    }
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    difficulty: "hard",
    tags: ["binary search"],
    constraints: "0 <= m, n <= 1000",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" }
    ],
    testCases: [
      { input: "1 3\n2", expectedOutput: "2", isSample: true },
      { input: "1 2\n3 4", expectedOutput: "2.5", isSample: false }
    ],
    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {\n    // Write your code here\n}`,
      python: `def find_median_sorted_arrays(nums1, nums2):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\ndouble findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    \n}`
    }
  },

  // LINKED LIST
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "easy",
    tags: ["linked list"],
    constraints: "The number of nodes in the list is the range [0, 5000].",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }
    ],
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1", isSample: true },
      { input: "1 2", expectedOutput: "2 1", isSample: false }
    ],
    starterCode: {
      javascript: `function reverseList(head) {\n    // Write your code here\n}`,
      python: `def reverse_list(head):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nListNode* reverseList(ListNode* head) {\n    \n}`
    }
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
    difficulty: "easy",
    tags: ["linked list"],
    constraints: "The number of nodes in both lists is in the range [0, 50].",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" }
    ],
    testCases: [
      { input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4", isSample: true },
      { input: "\n0", expectedOutput: "0", isSample: false }
    ],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {\n    // Write your code here\n}`,
      python: `def merge_two_lists(list1, list2):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    \n}`
    }
  },
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "hard",
    tags: ["linked list"],
    constraints: "0 <= k <= 10^4",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
    ],
    testCases: [
      { input: "1 4 5\n1 3 4\n2 6", expectedOutput: "1 1 2 3 4 4 5 6", isSample: true },
      { input: "", expectedOutput: "", isSample: false }
    ],
    starterCode: {
      javascript: `function mergeKLists(lists) {\n    // Write your code here\n}`,
      python: `def merge_k_lists(lists):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    \n}`
    }
  },

  // TREES
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    difficulty: "easy",
    tags: ["trees"],
    constraints: "The number of nodes in the tree is in the range [0, 100].",
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }
    ],
    testCases: [
      { input: "4 2 7 1 3 6 9", expectedOutput: "4 7 2 9 6 3 1", isSample: true },
      { input: "2 1 3", expectedOutput: "2 3 1", isSample: false }
    ],
    starterCode: {
      javascript: `function invertTree(root) {\n    // Write your code here\n}`,
      python: `def invert_tree(root):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nTreeNode* invertTree(TreeNode* root) {\n    \n}`
    }
  },
  {
    title: "Validate Binary Search Tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    difficulty: "medium",
    tags: ["trees"],
    constraints: "The number of nodes in the tree is in the range [1, 10^4].",
    examples: [
      { input: "root = [2,1,3]", output: "true" }
    ],
    testCases: [
      { input: "2 1 3", expectedOutput: "true", isSample: true },
      { input: "5 1 4 null null 3 6", expectedOutput: "false", isSample: false }
    ],
    starterCode: {
      javascript: `function isValidBST(root) {\n    // Write your code here\n}`,
      python: `def is_valid_bst(root):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nbool isValidBST(TreeNode* root) {\n    \n}`
    }
  },
  {
    title: "Binary Tree Maximum Path Sum",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.",
    difficulty: "hard",
    tags: ["trees"],
    constraints: "The number of nodes in the tree is in the range [1, 3 * 10^4].",
    examples: [
      { input: "root = [1,2,3]", output: "6" }
    ],
    testCases: [
      { input: "1 2 3", expectedOutput: "6", isSample: true },
      { input: "-10 9 20 null null 15 7", expectedOutput: "42", isSample: false }
    ],
    starterCode: {
      javascript: `function maxPathSum(root) {\n    // Write your code here\n}`,
      python: `def max_path_sum(root):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint maxPathSum(TreeNode* root) {\n    \n}`
    }
  },

  // GRAPHS
  {
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
    difficulty: "medium",
    tags: ["graphs"],
    constraints: "m == grid.length, n == grid[i].length, 1 <= m, n <= 300",
    examples: [
      { input: "grid = [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]", output: "1" }
    ],
    testCases: [
      { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", expectedOutput: "1", isSample: true },
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", expectedOutput: "3", isSample: false }
    ],
    starterCode: {
      javascript: `function numIslands(grid) {\n    // Write your code here\n}`,
      python: `def num_islands(grid):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint numIslands(vector<vector<char>>& grid) {\n    \n}`
    }
  },

  // DYNAMIC PROGRAMMING
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    tags: ["dynamic programming"],
    constraints: "1 <= n <= 45",
    examples: [
      { input: "n = 2", output: "2" }
    ],
    testCases: [
      { input: "2", expectedOutput: "2", isSample: true },
      { input: "3", expectedOutput: "3", isSample: false },
      { input: "5", expectedOutput: "8", isSample: false }
    ],
    starterCode: {
      javascript: `function climbStairs(n) {\n    // Write your code here\n}`,
      python: `def climb_stairs(n):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint climbStairs(int n) {\n    \n}`
    }
  },
  {
    title: "Coin Change",
    description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    difficulty: "medium",
    tags: ["dynamic programming"],
    constraints: "1 <= coins.length <= 12, 0 <= amount <= 10^4",
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3" }
    ],
    testCases: [
      { input: "1 2 5\n11", expectedOutput: "3", isSample: true },
      { input: "2\n3", expectedOutput: "-1", isSample: false }
    ],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n    // Write your code here\n}`,
      python: `def coin_change(coins, amount):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint coinChange(vector<int>& coins, int amount) {\n    \n}`
    }
  },
  {
    title: "Edit Distance",
    description: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character",
    difficulty: "hard",
    tags: ["dynamic programming"],
    constraints: "0 <= word1.length, word2.length <= 500",
    examples: [
      { input: "word1 = 'horse', word2 = 'ros'", output: "3" }
    ],
    testCases: [
      { input: "horse\nros", expectedOutput: "3", isSample: true },
      { input: "intention\nexecution", expectedOutput: "5", isSample: false }
    ],
    starterCode: {
      javascript: `function minDistance(word1, word2) {\n    // Write your code here\n}`,
      python: `def min_distance(word1, word2):\n    # Write your code here\n    pass`,
      cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint minDistance(string word1, string word2) {\n    \n}`
    }
  }
];

export const syncProblemsWithDB = async () => {
  try {
    console.log("🔄 Fetching problems dynamically from public online API...");
    let problemsToSync = fallbackProblems;

    try {
      const response = await axios.get(PUBLIC_PROBLEMS_URL, { timeout: 4000 });
      if (response.data && Array.isArray(response.data)) {
        problemsToSync = response.data;
        console.log(`✅ Loaded ${problemsToSync.length} problems from online repository.`);
      }
    } catch (fetchErr) {
      console.warn("⚠️ Could not load online problems (using pre-defined fallback list):", fetchErr.message);
    }

    for (const p of problemsToSync) {
      await Problem.findOneAndUpdate(
        { title: p.title },
        {
          $set: {
            description: p.description,
            difficulty: p.difficulty,
            tags: p.tags,
            constraints: p.constraints,
            examples: p.examples,
            testCases: p.testCases,
            starterCode: p.starterCode,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ MongoDB Problem Database synced successfully!`);
  } catch (err) {
    console.error("❌ Problem synchronization failed:", err.message);
  }
};
