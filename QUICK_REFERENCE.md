# Quick Reference - Admin Panel & Topic-Based Questions

## 📱 Admin Panel URLs

| Action | URL |
|--------|-----|
| Login | http://localhost:5174/login |
| Dashboard | http://localhost:5174/dashboard |
| Direct Access | http://localhost:5174 (redirects to dashboard) |

---

## 🔑 Admin Panel Credentials

Use your existing admin email and password from the User model.

```javascript
// Make sure your admin user exists in DB with isAdmin: true
{
  username: "admin_name",
  email: "admin@codeduel.com",
  password: "hashed_password",
  isAdmin: true
}
```

---

## 🎯 Frontend - Fetch Problems by Topic

### Current Game Arena - Update to use topic:

```javascript
// OLD (would try online fetch) - DON'T USE
// const response = await fetch('/api/problems/random');

// NEW - Fetch by topic selected by user
const topic = selectedTopic; // e.g., "arrays", "strings"

const response = await fetch(
  `http://localhost:5000/api/problems/random?topic=${topic}`
);
const data = await response.json();
const problem = data.problem;

// Display problem to user
console.log(problem.title);
console.log(problem.description);
console.log(problem.starterCode.javascript);
```

### With Difficulty Filter:

```javascript
const topic = "arrays";
const difficulty = "medium"; // or "easy", "hard"

const response = await fetch(
  `http://localhost:5000/api/problems/random?topic=${topic}&difficulty=${difficulty}`
);
const { problem } = await response.json();
```

### Handle "No Problems" Error:

```javascript
const response = await fetch(
  `http://localhost:5000/api/problems/random?topic=${topic}`
);

if (response.status === 404) {
  alert("No problems found for this topic. Add problems in Admin Panel!");
  return;
}

const { problem } = await response.json();
// Use problem...
```

---

## 🏷️ Suggested Topics to Create

Start with these commonly used topics:

```
1. arrays
2. strings
3. hash-table
4. two-pointers
5. sliding-window
6. binary-search
7. sorting
8. stack
9. queue
10. linked-list
11. trees
12. graphs
13. dynamic-programming
14. recursion
15. backtracking
16. greedy
17. math
18. bit-manipulation
19. design
20. database
```

---

## 📊 Admin Dashboard - Problem Statistics

The dashboard shows:

- **Total Problems**: All problems in database
- **Active Problems**: Problems with isActive = true
- **Inactive Problems**: Problems with isActive = false
- **Topics**: All unique topics/tags
- **By Difficulty**: Count of easy/medium/hard

---

## 🛠️ Problem Fields Explanation

| Field | Type | Required | Example |
|-------|------|----------|---------|
| title | String | ✅ | "Two Sum" |
| description | String | ✅ | "Given an array of integers..." |
| difficulty | String | ✅ | "easy", "medium", "hard" |
| tags | Array | ❌ | ["arrays", "hashmap"] |
| constraints | String | ❌ | "1 <= n <= 10^5" |
| examples | Array | ❌ | [{input, output, explanation}] |
| testCases | Array | ❌ | [{input, expectedOutput, isSample}] |
| starterCode | Object | ❌ | {javascript, python, cpp, java, typescript} |
| isActive | Boolean | Auto | true (default) |
| source | String | Auto | "internal" (all manual entries) |

---

## 💾 Sample Question JSON

```json
{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
  "difficulty": "easy",
  "tags": ["arrays", "hashmap"],
  "constraints": "2 <= nums.length <= 10^4",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ],
  "testCases": [
    {
      "input": "2 7 11 15\n9",
      "expectedOutput": "0 1",
      "isSample": true
    }
  ],
  "starterCode": {
    "javascript": "function twoSum(nums, target) {\n  // TODO: Write your solution\n}",
    "python": "def twoSum(nums, target):\n  # TODO: Write your solution\n  pass"
  }
}
```

---

## 🚀 Setup Checklist

- [ ] `cd admin-panel && npm install` (to add react-router-dom)
- [ ] Start backend: `node index.js`
- [ ] Start admin panel: `npm run dev`
- [ ] Login at http://localhost:5174
- [ ] Add first 5 questions
- [ ] Test fetching by topic in console:
  ```javascript
  fetch('http://localhost:5000/api/problems/random?topic=arrays')
    .then(r => r.json())
    .then(d => console.log(d.problem))
  ```
- [ ] Update frontend to use topic parameter
- [ ] Test in game!

---

## 🆘 Common Issues & Fixes

### Issue: "Cannot POST /api/admin/problems"
**Fix**: Make sure you're logged in as admin. Check Authorization header.

### Issue: "No problems found"
**Fix**: 
1. Add problems via Admin Panel
2. Make sure `isActive: true`
3. Check if topic spelling matches exactly

### Issue: Admin Panel shows blank page
**Fix**: 
1. Run `npm install` to add missing dependencies
2. Check browser console (F12) for errors
3. Restart dev server

### Issue: Can't login to admin
**Fix**: 
1. Create admin user in DB with `isAdmin: true`
2. Run `node makeAdmin.js <userId>` if script exists
3. Verify email/password in database

---

## 📚 More Information

See detailed guides:
- **ADMIN_PANEL_SETUP.md** - Complete admin panel guide
- **IMPLEMENTATION_SUMMARY.md** - All changes made

---

## 🎉 You're Ready!

1. Add questions via Admin Panel
2. Frontend requests by topic
3. Random questions displayed in game
4. No more online API dependency!

Enjoy! 🚀
