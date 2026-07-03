import dotenv from "dotenv";
import mongoose from "mongoose";
import Problem from "./src/models/Problem.model.js";

dotenv.config();

const problems = [
  /* ══════════════ ARRAYS ══════════════ */
  {
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to the target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    difficulty: "easy",
    tags: ["arrays", "hashing"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9, so return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: false },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false },
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n    // Write your solution here\n    const map = {};\n    for (let i = 0; i < nums.length; i++) {\n        \n    }\n}",
      python: "def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, n in enumerate(nums):\n        pass",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    \n}",
      java: "import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      c: "#include<stdio.h>\nvoid twoSum(int* nums, int numsSize, int target, int* result) {\n    \n}",
    },
    isActive: true,
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    difficulty: "medium",
    tags: ["arrays", "dynamic programming"],
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isSample: true },
      { input: "1\n1", expectedOutput: "1", isSample: false },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isSample: false },
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n    // Kadane's algorithm hint: track current sum and max sum\n}",
      python: "def max_sub_array(nums):\n    # Kadane's algorithm hint: track current sum and max sum\n    pass",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n    \n}",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
      c: "#include<stdio.h>\nint maxSubArray(int* nums, int numsSize) {\n    \n}",
    },
    isActive: true,
  },
  {
    title: "Contains Duplicate",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    difficulty: "easy",
    tags: ["arrays", "hashing"],
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "true", isSample: true },
      { input: "4\n1 2 3 4", expectedOutput: "false", isSample: false },
      { input: "10\n1 1 1 3 3 4 3 2 4 2", expectedOutput: "true", isSample: false },
    ],
    starterCode: {
      javascript: "function containsDuplicate(nums) {\n    \n}",
      python: "def contains_duplicate(nums):\n    pass",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nbool containsDuplicate(vector<int>& nums) {\n    \n}",
      java: "import java.util.*;\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
      c: "#include<stdio.h>\nint containsDuplicate(int* nums, int numsSize) {\n    \n}",
    },
    isActive: true,
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
    difficulty: "easy",
    tags: ["arrays", "two pointers"],
    examples: [
      { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]" },
      { input: "nums = [0]", output: "[0]" },
    ],
    constraints: "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
    testCases: [
      { input: "5\n0 1 0 3 12", expectedOutput: "1 3 12 0 0", isSample: true },
      { input: "1\n0", expectedOutput: "0", isSample: false },
      { input: "6\n1 0 0 2 3 0", expectedOutput: "1 2 3 0 0 0", isSample: false },
    ],
    starterCode: {
      javascript: "function moveZeroes(nums) {\n    // In-place, two-pointer approach\n}",
      python: "def move_zeroes(nums):\n    pass",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nvoid moveZeroes(vector<int>& nums) {\n    \n}",
      java: "class Solution {\n    public void moveZeroes(int[] nums) {\n        \n    }\n}",
      c: "#include<stdio.h>\nvoid moveZeroes(int* nums, int numsSize) {\n    \n}",
    },
    isActive: true,
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    difficulty: "easy",
    tags: ["arrays", "sliding window"],
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No transactions are done, max profit = 0." },
    ],
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    testCases: [
      { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isSample: true },
      { input: "5\n7 6 4 3 1", expectedOutput: "0", isSample: false },
      { input: "4\n1 2 3 4", expectedOutput: "3", isSample: false },
    ],
    starterCode: {
      javascript: "function maxProfit(prices) {\n    \n}",
      python: "def max_profit(prices):\n    pass",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint maxProfit(vector<int>& prices) {\n    \n}",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}",
      c: "#include<stdio.h>\nint maxProfit(int* prices, int pricesSize) {\n    \n}",
    },
    isActive: true,
  },

  /* ══════════════ STRINGS ══════════════ */
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    difficulty: "easy",
    tags: ["strings", "two pointers"],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false" },
      { input: 's = " "', output: "true", explanation: "After removing non-alphanumeric chars, empty string is a palindrome." },
    ],
    constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
    testCases: [
      { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isSample: true },
      { input: "race a car", expectedOutput: "false", isSample: false },
      { input: " ", expectedOutput: "true", isSample: false },
    ],
    starterCode: {
      javascript: "function isPalindrome(s) {\n    \n}",
      python: "def is_palindrome(s):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nbool isPalindrome(string s) {\n    \n}',
      java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}',
      c: '#include<stdio.h>\n#include<string.h>\nint isPalindrome(char* s) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Valid Anagram",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "easy",
    tags: ["strings", "hashing"],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
    ],
    constraints: "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
    testCases: [
      { input: "anagram\nnagaram", expectedOutput: "true", isSample: true },
      { input: "rat\ncar", expectedOutput: "false", isSample: false },
      { input: "listen\nsilent", expectedOutput: "true", isSample: false },
    ],
    starterCode: {
      javascript: "function isAnagram(s, t) {\n    \n}",
      python: "def is_anagram(s, t):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nbool isAnagram(string s, string t) {\n    \n}',
      java: 'class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint isAnagram(char* s, char* t) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Longest Common Prefix",
    description: "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string `\"\"`.",
    difficulty: "easy",
    tags: ["strings"],
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: "There is no common prefix among the input strings." },
    ],
    constraints: "1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
    testCases: [
      { input: "3\nflower\nflow\nflight", expectedOutput: "fl", isSample: true },
      { input: "3\ndog\nracecar\ncar", expectedOutput: "", isSample: false },
      { input: "1\nalone", expectedOutput: "alone", isSample: false },
    ],
    starterCode: {
      javascript: "function longestCommonPrefix(strs) {\n    \n}",
      python: "def longest_common_prefix(strs):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstring longestCommonPrefix(vector<string>& strs) {\n    \n}',
      java: 'class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        \n    }\n}',
      c: '#include<stdio.h>\nchar* longestCommonPrefix(char** strs, int strsSize) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Reverse Words in a String",
    description: "Given an input string `s`, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.\n\nNote that `s` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.",
    difficulty: "medium",
    tags: ["strings", "two pointers"],
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
      { input: 's = "  hello world  "', output: '"world hello"' },
      { input: 's = "a good   example"', output: '"example good a"' },
    ],
    constraints: "1 <= s.length <= 10^4\ns contains English letters (upper-case and lower-case), digits, and spaces ' '.\nThere is at least one word in s.",
    testCases: [
      { input: "the sky is blue", expectedOutput: "blue is sky the", isSample: true },
      { input: "  hello world  ", expectedOutput: "world hello", isSample: false },
      { input: "a good   example", expectedOutput: "example good a", isSample: false },
    ],
    starterCode: {
      javascript: "function reverseWords(s) {\n    \n}",
      python: "def reverse_words(s):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstring reverseWords(string s) {\n    \n}',
      java: 'class Solution {\n    public String reverseWords(String s) {\n        \n    }\n}',
      c: '#include<stdio.h>\nchar* reverseWords(char* s) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ BINARY SEARCH ══════════════ */
  {
    title: "Binary Search",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    difficulty: "easy",
    tags: ["binary search", "arrays"],
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1." },
    ],
    constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
    testCases: [
      { input: "6\n-1 0 3 5 9 12\n9", expectedOutput: "4", isSample: true },
      { input: "6\n-1 0 3 5 9 12\n2", expectedOutput: "-1", isSample: false },
      { input: "1\n5\n5", expectedOutput: "0", isSample: false },
    ],
    starterCode: {
      javascript: "function search(nums, target) {\n    let left = 0, right = nums.length - 1;\n    // Binary search\n}",
      python: "def search(nums, target):\n    left, right = 0, len(nums) - 1\n    # Binary search\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint search(vector<int>& nums, int target) {\n    \n}',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint search(int* nums, int numsSize, int target) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Search Insert Position",
    description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    difficulty: "easy",
    tags: ["binary search", "arrays"],
    examples: [
      { input: "nums = [1,3,5,6], target = 5", output: "2" },
      { input: "nums = [1,3,5,6], target = 2", output: "1" },
      { input: "nums = [1,3,5,6], target = 7", output: "4" },
    ],
    constraints: "1 <= nums.length <= 10^4\n-10^4 <= nums[i] <= 10^4\nnums contains distinct values sorted in ascending order.\n-10^4 <= target <= 10^4",
    testCases: [
      { input: "4\n1 3 5 6\n5", expectedOutput: "2", isSample: true },
      { input: "4\n1 3 5 6\n2", expectedOutput: "1", isSample: false },
      { input: "4\n1 3 5 6\n7", expectedOutput: "4", isSample: false },
    ],
    starterCode: {
      javascript: "function searchInsert(nums, target) {\n    \n}",
      python: "def search_insert(nums, target):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint searchInsert(vector<int>& nums, int target) {\n    \n}',
      java: 'class Solution {\n    public int searchInsert(int[] nums, int target) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint searchInsert(int* nums, int numsSize, int target) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    description: "Suppose an array of length `n` sorted in ascending order is rotated between 1 and n times.\n\nGiven the sorted rotated array `nums` of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in `O(log n)` time.",
    difficulty: "medium",
    tags: ["binary search", "arrays"],
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1", explanation: "The original array was [1,2,3,4,5] rotated 3 times." },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
      { input: "nums = [11,13,15,17]", output: "11" },
    ],
    constraints: "n == nums.length\n1 <= n <= 5000\n-5000 <= nums[i] <= 5000\nAll the integers of nums are unique.\nnums is sorted and rotated between 1 and n times.",
    testCases: [
      { input: "5\n3 4 5 1 2", expectedOutput: "1", isSample: true },
      { input: "7\n4 5 6 7 0 1 2", expectedOutput: "0", isSample: false },
      { input: "4\n11 13 15 17", expectedOutput: "11", isSample: false },
    ],
    starterCode: {
      javascript: "function findMin(nums) {\n    \n}",
      python: "def find_min(nums):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint findMin(vector<int>& nums) {\n    \n}',
      java: 'class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint findMin(int* nums, int numsSize) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ LINKED LIST ══════════════ */
  {
    title: "Reverse Linked List",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.\n\nFor this problem, input/output is represented as a space-separated list of node values. Return the values of the reversed list separated by spaces.",
    difficulty: "easy",
    tags: ["linked list"],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isSample: true },
      { input: "2\n1 2", expectedOutput: "2 1", isSample: false },
      { input: "1\n42", expectedOutput: "42", isSample: false },
    ],
    starterCode: {
      javascript: "function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        \n    }\n    return prev;\n}",
      python: "def reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        pass\n    return prev",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr){} };\nListNode* reverseList(ListNode* head) {\n    \n}',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct ListNode { int val; struct ListNode* next; };\nstruct ListNode* reverseList(struct ListNode* head) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Middle of the Linked List",
    description: "Given the `head` of a singly linked list, return the middle node of the linked list.\n\nIf there are two middle nodes, return the second middle node.\n\nInput/output represented as space-separated node values.",
    difficulty: "easy",
    tags: ["linked list", "two pointers"],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[3,4,5]", explanation: "The middle node of the list is node 3." },
      { input: "head = [1,2,3,4,5,6]", output: "[4,5,6]", explanation: "Since the list has two middle nodes with values 3 and 4, return the second one." },
    ],
    constraints: "The number of nodes in the list is in the range [1, 100].\n1 <= Node.val <= 100",
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "3 4 5", isSample: true },
      { input: "6\n1 2 3 4 5 6", expectedOutput: "4 5 6", isSample: false },
      { input: "1\n1", expectedOutput: "1", isSample: false },
    ],
    starterCode: {
      javascript: "function middleNode(head) {\n    let slow = head, fast = head;\n    while (fast && fast.next) {\n        \n    }\n    return slow;\n}",
      python: "def middle_node(head):\n    slow = fast = head\n    while fast and fast.next:\n        pass\n    return slow",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr){} };\nListNode* middleNode(ListNode* head) {\n    \n}',
      java: 'class Solution {\n    public ListNode middleNode(ListNode head) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct ListNode { int val; struct ListNode* next; };\nstruct ListNode* middleNode(struct ListNode* head) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list. Output as space-separated values.",
    difficulty: "easy",
    tags: ["linked list", "recursion"],
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
    testCases: [
      { input: "3\n1 2 4\n3\n1 3 4", expectedOutput: "1 1 2 3 4 4", isSample: true },
      { input: "0\n\n0\n", expectedOutput: "", isSample: false },
      { input: "0\n\n1\n0", expectedOutput: "0", isSample: false },
    ],
    starterCode: {
      javascript: "function mergeTwoLists(list1, list2) {\n    \n}",
      python: "def merge_two_lists(list1, list2):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr){} };\nListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    \n}',
      java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct ListNode { int val; struct ListNode* next; };\nstruct ListNode* mergeTwoLists(struct ListNode* l1, struct ListNode* l2) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ TREES ══════════════ */
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\nInput format: Level-order traversal separated by spaces. Use -1 for null nodes.",
    difficulty: "easy",
    tags: ["trees", "recursion"],
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = [1,null,2]", output: "2" },
    ],
    constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100",
    testCases: [
      { input: "7\n3 9 20 -1 -1 15 7", expectedOutput: "3", isSample: true },
      { input: "3\n1 -1 2", expectedOutput: "2", isSample: false },
      { input: "0", expectedOutput: "0", isSample: false },
    ],
    starterCode: {
      javascript: "function maxDepth(root) {\n    if (!root) return 0;\n    // Recursive DFS\n}",
      python: "def max_depth(root):\n    if not root:\n        return 0\n    # Recursive DFS",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x): val(x), left(nullptr), right(nullptr){} };\nint maxDepth(TreeNode* root) {\n    \n}',
      java: 'class Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct TreeNode { int val; struct TreeNode* left; struct TreeNode* right; };\nint maxDepth(struct TreeNode* root) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Invert Binary Tree",
    description: "Given the `root` of a binary tree, invert the tree, and return its root.\n\nInverting means swapping the left and right children of every node.\n\nInput/output: Level-order traversal, -1 for null.",
    difficulty: "easy",
    tags: ["trees", "recursion"],
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
      { input: "root = [2,1,3]", output: "[2,3,1]" },
    ],
    constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
    testCases: [
      { input: "7\n4 2 7 1 3 6 9", expectedOutput: "4 7 2 9 6 3 1", isSample: true },
      { input: "3\n2 1 3", expectedOutput: "2 3 1", isSample: false },
      { input: "0", expectedOutput: "", isSample: false },
    ],
    starterCode: {
      javascript: "function invertTree(root) {\n    if (!root) return null;\n    // Swap children recursively\n}",
      python: "def invert_tree(root):\n    if not root:\n        return None\n    # Swap children recursively",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x): val(x), left(nullptr), right(nullptr){} };\nTreeNode* invertTree(TreeNode* root) {\n    \n}',
      java: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct TreeNode { int val; struct TreeNode* left; struct TreeNode* right; };\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Symmetric Tree",
    description: "Given the `root` of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).\n\nInput: Level-order traversal, -1 for null.",
    difficulty: "easy",
    tags: ["trees", "recursion"],
    examples: [
      { input: "root = [1,2,2,3,4,4,3]", output: "true" },
      { input: "root = [1,2,2,null,3,null,3]", output: "false" },
    ],
    constraints: "The number of nodes in the tree is in the range [1, 1000].\n-100 <= Node.val <= 100",
    testCases: [
      { input: "7\n1 2 2 3 4 4 3", expectedOutput: "true", isSample: true },
      { input: "5\n1 2 2 -1 3 -1 3", expectedOutput: "false", isSample: false },
      { input: "1\n1", expectedOutput: "true", isSample: false },
    ],
    starterCode: {
      javascript: "function isSymmetric(root) {\n    function mirror(left, right) {\n        if (!left && !right) return true;\n        if (!left || !right) return false;\n        \n    }\n    return mirror(root.left, root.right);\n}",
      python: "def is_symmetric(root):\n    def mirror(left, right):\n        if not left and not right: return True\n        if not left or not right: return False\n        pass\n    return mirror(root.left, root.right)",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nstruct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x): val(x), left(nullptr), right(nullptr){} };\nbool isSymmetric(TreeNode* root) {\n    \n}',
      java: 'class Solution {\n    public boolean isSymmetric(TreeNode root) {\n        \n    }\n}',
      c: '#include<stdio.h>\nstruct TreeNode { int val; struct TreeNode* left; struct TreeNode* right; };\nint isSymmetric(struct TreeNode* root) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ DYNAMIC PROGRAMMING ══════════════ */
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    tags: ["dynamic programming", "math"],
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1" },
    ],
    constraints: "1 <= n <= 45",
    testCases: [
      { input: "2", expectedOutput: "2", isSample: true },
      { input: "3", expectedOutput: "3", isSample: false },
      { input: "10", expectedOutput: "89", isSample: false },
    ],
    starterCode: {
      javascript: "function climbStairs(n) {\n    // Hint: dp[i] = dp[i-1] + dp[i-2]\n}",
      python: "def climb_stairs(n):\n    # Hint: dp[i] = dp[i-1] + dp[i-2]\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint climbStairs(int n) {\n    \n}',
      java: 'class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint climbStairs(int n) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    difficulty: "medium",
    tags: ["dynamic programming", "arrays"],
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 1 (money=1) then house 3 (money=3). Total = 4." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob house 1, 3, 5. Total = 2+9+1=12." },
    ],
    constraints: "1 <= nums.length <= 100\n0 <= nums[i] <= 400",
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "4", isSample: true },
      { input: "5\n2 7 9 3 1", expectedOutput: "12", isSample: false },
      { input: "1\n5", expectedOutput: "5", isSample: false },
    ],
    starterCode: {
      javascript: "function rob(nums) {\n    // dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n}",
      python: "def rob(nums):\n    # dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint rob(vector<int>& nums) {\n    \n}',
      java: 'class Solution {\n    public int rob(int[] nums) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint rob(int* nums, int numsSize) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Coin Change",
    description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.",
    difficulty: "medium",
    tags: ["dynamic programming", "arrays"],
    examples: [
      { input: "coins = [1,5,11,15,20,25], amount = 36", output: "3", explanation: "11 + 25 = 36 (2 coins)" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
    testCases: [
      { input: "3\n1 5 11\n11", expectedOutput: "1", isSample: true },
      { input: "1\n2\n3", expectedOutput: "-1", isSample: false },
      { input: "1\n1\n0", expectedOutput: "0", isSample: false },
    ],
    starterCode: {
      javascript: "function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    // Fill dp array\n}",
      python: "def coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    # Fill dp array\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint coinChange(vector<int>& coins, int amount) {\n    \n}',
      java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint coinChange(int* coins, int coinsSize, int amount) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\n`F(0) = 0, F(1) = 1`\n`F(n) = F(n - 1) + F(n - 2)` for `n > 1`.\n\nGiven `n`, calculate `F(n)`.",
    difficulty: "easy",
    tags: ["dynamic programming", "math", "recursion"],
    examples: [
      { input: "n = 2", output: "1", explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1." },
      { input: "n = 3", output: "2" },
      { input: "n = 4", output: "3" },
    ],
    constraints: "0 <= n <= 30",
    testCases: [
      { input: "2", expectedOutput: "1", isSample: true },
      { input: "3", expectedOutput: "2", isSample: false },
      { input: "10", expectedOutput: "55", isSample: false },
    ],
    starterCode: {
      javascript: "function fib(n) {\n    \n}",
      python: "def fib(n):\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint fib(int n) {\n    \n}',
      java: 'class Solution {\n    public int fib(int n) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint fib(int n) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ GRAPHS ══════════════ */
  {
    title: "Number of Islands",
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.\n\nInput: First line = rows, second line = columns. Then each row as space-separated 0s and 1s.",
    difficulty: "medium",
    tags: ["graphs", "arrays", "recursion"],
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" },
    ],
    constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
    testCases: [
      { input: "4\n5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", expectedOutput: "1", isSample: true },
      { input: "4\n5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", expectedOutput: "3", isSample: false },
      { input: "1\n1\n1", expectedOutput: "1", isSample: false },
    ],
    starterCode: {
      javascript: "function numIslands(grid) {\n    function dfs(r, c) {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') return;\n        grid[r][c] = '0'; // mark visited\n        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n    }\n    let count = 0;\n    // Iterate grid\n}",
      python: "def num_islands(grid):\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':\n            return\n        grid[r][c] = '0'\n        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)\n    count = 0\n    # Iterate grid\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint numIslands(vector<vector<char>>& grid) {\n    \n}',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint numIslands(char** grid, int gridSize, int* gridColSize) {\n    \n}',
    },
    isActive: true,
  },

  /* ══════════════ MATH ══════════════ */
  {
    title: "Palindrome Number",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\nFor example, `121` is a palindrome while `123` is not.\n\nDo not convert the integer to a string.",
    difficulty: "easy",
    tags: ["math"],
    examples: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." },
      { input: "x = 10", output: "false" },
    ],
    constraints: "-2^31 <= x <= 2^31 - 1",
    testCases: [
      { input: "121", expectedOutput: "true", isSample: true },
      { input: "-121", expectedOutput: "false", isSample: false },
      { input: "10", expectedOutput: "false", isSample: false },
    ],
    starterCode: {
      javascript: "function isPalindrome(x) {\n    if (x < 0) return false;\n    // Reverse the number without string conversion\n}",
      python: "def is_palindrome(x):\n    if x < 0:\n        return False\n    # Reverse without string conversion\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nbool isPalindrome(int x) {\n    \n}',
      java: 'class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint isPalindrome(int x) {\n    \n}',
    },
    isActive: true,
  },
  {
    title: "Power of Two",
    description: "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.\n\nAn integer `n` is a power of two if there exists an integer `x` such that `n == 2^x`.\n\nHint: Think about the binary representation of powers of two.",
    difficulty: "easy",
    tags: ["math", "bit manipulation"],
    examples: [
      { input: "n = 1", output: "true", explanation: "2^0 = 1" },
      { input: "n = 16", output: "true", explanation: "2^4 = 16" },
      { input: "n = 3", output: "false" },
    ],
    constraints: "-2^31 <= n <= 2^31 - 1",
    testCases: [
      { input: "1", expectedOutput: "true", isSample: true },
      { input: "16", expectedOutput: "true", isSample: false },
      { input: "3", expectedOutput: "false", isSample: false },
    ],
    starterCode: {
      javascript: "function isPowerOfTwo(n) {\n    // Bit manipulation: n & (n-1) == 0 for powers of 2\n}",
      python: "def is_power_of_two(n):\n    # Bit manipulation: n & (n-1) == 0 for powers of 2\n    pass",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nbool isPowerOfTwo(int n) {\n    \n}',
      java: 'class Solution {\n    public boolean isPowerOfTwo(int n) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint isPowerOfTwo(int n) {\n    \n}',
    },
    isActive: true,
  },
  /* ══════════════ TWO POINTERS ══════════════ */
  {
    title: "Valid Palindrome II",
    description: "Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.",
    difficulty: "easy",
    tags: ["strings", "two pointers", "greedy"],
    examples: [
      { input: 's = "aba"', output: "true" },
      { input: 's = "abca"', output: "true", explanation: "You could delete the character 'c' or 'b'." },
      { input: 's = "abc"', output: "false" },
    ],
    constraints: "1 <= s.length <= 10^5\ns consists of lowercase English letters.",
    testCases: [
      { input: "aba", expectedOutput: "true", isSample: true },
      { input: "abca", expectedOutput: "true", isSample: false },
      { input: "abc", expectedOutput: "false", isSample: false },
    ],
    starterCode: {
      javascript: "function validPalindrome(s) {\n    function isPalin(l, r) {\n        while (l < r) {\n            if (s[l] !== s[r]) return false;\n            l++; r--;\n        }\n        return true;\n    }\n    let l = 0, r = s.length - 1;\n    while (l < r) {\n        if (s[l] !== s[r]) return isPalin(l+1, r) || isPalin(l, r-1);\n        l++; r--;\n    }\n    return true;\n}",
      python: "def valid_palindrome(s):\n    def is_palin(l, r):\n        while l < r:\n            if s[l] != s[r]: return False\n            l += 1; r -= 1\n        return True\n    l, r = 0, len(s) - 1\n    while l < r:\n        if s[l] != s[r]:\n            return is_palin(l+1, r) or is_palin(l, r-1)\n        l += 1; r -= 1\n    return True",
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nbool validPalindrome(string s) {\n    \n}',
      java: 'class Solution {\n    public boolean validPalindrome(String s) {\n        \n    }\n}',
      c: '#include<stdio.h>\nint validPalindrome(char* s) {\n    \n}',
    },
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Problem.deleteMany({});
    await Problem.insertMany(problems);

    console.log(`✅ ${problems.length} problems seeded successfully!`);

    const topicCount = {};
    problems.forEach(p => p.tags.forEach(t => { topicCount[t] = (topicCount[t] || 0) + 1; }));
    console.log("\n📊 Problems by topic:");
    Object.entries(topicCount).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
