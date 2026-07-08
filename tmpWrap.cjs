function findMin(nums){ return Math.min(...nums); }
const fs = require("fs");
const tokens = fs.readFileSync(0, "utf-8").trim().split(/s+/).filter(Boolean).map(Number);
const count = tokens[0];
const arr = tokens.slice(1, 1 + count);
console.log(findMin(arr));