# CodeDuel - Admin Panel Setup Guide

## Overview
The online question fetching has been disabled. All questions are now managed through the **Admin Panel** where you can manually add, edit, delete, and activate/deactivate problems.

## What Changed

### 1. **Disabled Online Fetching**
- `src/utils/problemFetcher.js` - Now only checks if problems exist in the database
- Questions are no longer fetched from external GitHub repositories
- The fallback problems are still available as reference but not auto-synced

### 2. **Enhanced Problem Selection**
- Added topic/tag filtering support
- `/api/problems/random?topic=arrays` - Get random problem by topic
- `/api/problems/random?topic=strings&difficulty=easy` - Filter by topic AND difficulty

### 3. **New Admin Dashboard**
- Full problem management interface
- Add, edit, delete problems
- Filter by difficulty, topic, status
- Search functionality

---

## How to Setup

### Step 1: Install Dependencies
```bash
cd admin-panel
npm install  # This will add react-router-dom
```

### Step 2: Start the Admin Panel
```bash
npm run dev
# Admin panel will run on http://localhost:5174
```

### Step 3: Access Admin Panel
1. Go to `http://localhost:5174`
2. Login with your admin credentials
3. You'll see the Dashboard with Problem Management

---

## How to Add Questions

### Method 1: Use Admin Panel UI (Recommended)

1. **Login to Admin Panel**
   - URL: `http://localhost:5174`
   - Enter admin email & password

2. **Click "Add New Problem"**
   - Opens a modal form

3. **Fill in the form:**

   **Basic Information:**
   - Title (required): e.g., "Two Sum"
   - Description (required): Detailed problem description
   - Difficulty: Select from Easy, Medium, Hard
   - Constraints: Optional, e.g., "1 <= n <= 10^5"

   **Topics/Tags:**
   - Click "+ Add Topic" button
   - Enter topic name (e.g., "arrays", "strings", "binary search")
   - You can add multiple topics to one problem

   **Examples:**
   - Click "+ Add Example" for each example
   - Input: Example input
   - Output: Expected output
   - Explanation: Why this output

   **Test Cases:**
   - Click "+ Add Test Case"
   - Input: Test input data
   - Expected Output: Expected result
   - Check "Sample Test Case" if it's a sample

   **Starter Code (Optional):**
   - Provide template code for JavaScript, Python, C++, Java, TypeScript
   - Users will see this template when attempting the problem

4. **Click "Create Problem"** to save

### Example: Adding "Two Sum"
```
Title: Two Sum
Description: Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.
Difficulty: Easy
Topics: arrays, hashmap
Constraints: 2 <= nums.length <= 10^4

Example 1:
  Input: nums = [2,7,11,15], target = 9
  Output: [0,1]
  Explanation: nums[0] + nums[1] = 2 + 7 = 9

Test Case 1:
  Input: 2 7 11 15\n9
  Expected Output: 0 1
  Sample: Yes
```

---

## How to Filter & Search Questions

**In Admin Dashboard:**

1. **Search**: Type in the search box to find by title
2. **Filter by Difficulty**: Select Easy, Medium, or Hard
3. **Filter by Topic**: Select a topic to see only problems with that tag
4. **Filter by Status**: Show Active/Inactive problems
5. **Pagination**: Navigate through pages

---

## How to Use Topics in Your Game

### Setting Topic-based Matchmaking

When users select a topic to practice:

```javascript
// Frontend code to get random problem by topic
const topic = "arrays"; // User selected this topic
const difficulty = "easy";

const response = await fetch(
  `http://localhost:5000/api/problems/random?topic=${topic}&difficulty=${difficulty}`
);
const { problem } = await response.json();
// Display problem to user
```

**Query Parameters:**
- `topic`: The topic/tag name (e.g., "arrays", "strings")
- `difficulty`: Optional, "easy", "medium", "hard"

**Example URLs:**
- `/api/problems/random?topic=arrays`
- `/api/problems/random?topic=strings&difficulty=medium`
- `/api/problems/random?difficulty=hard` (no topic filter)

---

## API Endpoints Available

### Get All Problems
```
GET /api/problems
Response:
{
  success: true,
  count: 10,
  problems: [...]
}
```

### Get Random Problem
```
GET /api/problems/random?topic=arrays&difficulty=easy
Response:
{
  success: true,
  problem: { _id, title, description, ... }
}
```

### Admin Endpoints (Protected)

**List Problems:**
```
GET /api/admin/problems?page=1&limit=10&difficulty=easy&topic=arrays
```

**Get Single Problem:**
```
GET /api/admin/problems/:id
```

**Create Problem:**
```
POST /api/admin/problems
Body: { title, description, difficulty, tags, ... }
```

**Update Problem:**
```
PUT /api/admin/problems/:id
Body: { ...updated fields }
```

**Delete Problem:**
```
DELETE /api/admin/problems/:id
```

**Toggle Active Status:**
```
PATCH /api/admin/problems/:id/toggle
```

**Get Dashboard Stats:**
```
GET /api/admin/stats
Response: {
  stats: {
    problems: { total, active, inactive },
    users: { total, admins },
    byTopic: [...],
    byDifficulty: [...]
  }
}
```

---

## Problem Structure

Each problem stored in MongoDB has this structure:

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: "easy" | "medium" | "hard",
  tags: [String],  // e.g., ["arrays", "hashmap"]
  constraints: String,
  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],
  testCases: [
    {
      input: String,
      expectedOutput: String,
      isSample: Boolean
    }
  ],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String,
    typescript: String
  },
  source: "internal",  // All manual entries are "internal"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Tips & Best Practices

### 1. **Organize by Topics**
Create clear topic names:
- `arrays`
- `strings`
- `binary-search`
- `dynamic-programming`
- `linked-lists`
- `trees`
- `graphs`
- etc.

### 2. **Difficulty Balance**
- Add multiple problems at each difficulty level
- Easy: 20-30 problems
- Medium: 25-35 problems
- Hard: 15-20 problems

### 3. **Test Cases**
- Include at least 3-5 test cases per problem
- Mark 1-2 as "Sample Test Case" (shown to users)
- Other test cases run silently for validation

### 4. **Starter Code**
- Provide clear, well-commented starter code
- Include function signature
- Add TODO comments for where users should write

### 5. **Constraints**
- Always specify constraints
- Helps users understand edge cases
- Useful for optimization hints

---

## Troubleshooting

### Problem 1: Can't add problems
- Check if you're logged in with admin account
- Verify `isAdmin` flag is true in User model
- Check browser console for error messages

### Problem 2: Problems not showing in game
- Verify problem has `isActive: true`
- Check if `tags` array is populated
- Ensure difficulty is set to one of: easy, medium, hard

### Problem 3: Topics not filtering correctly
- Check that tags are entered exactly (case-sensitive)
- Use consistent topic names
- Remove any accidental spaces

---

## Database Seeding (Optional)

If you want to seed some initial problems:

1. Create a `seed-problems.js` file in root
2. Run it once: `node seed-problems.js`
3. Then use Admin Panel for managing questions

Example seed file:
```javascript
import Problem from './src/models/Problem.model.js';
import connectDB from './src/db/connect.js';

connectDB();

const problems = [
  {
    title: "Two Sum",
    description: "Given an array...",
    difficulty: "easy",
    tags: ["arrays"],
    // ... rest of fields
  },
  // More problems...
];

await Problem.insertMany(problems);
console.log("Problems seeded!");
```

---

## Next Steps

1. **Install dependencies**: `cd admin-panel && npm install`
2. **Start admin panel**: `npm run dev`
3. **Login with admin credentials**
4. **Add your first 5 problems**
5. **Test in your game**: Request problems by topic
6. **Iterate**: Add more problems as needed

---

## Support

For issues:
1. Check browser console (F12 → Console tab)
2. Check server logs (terminal where backend is running)
3. Verify all fields are filled in the form
4. Ensure database connection is working
