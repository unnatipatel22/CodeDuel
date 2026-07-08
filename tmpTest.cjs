function findMin(nums){ return Math.min(...nums); }
const fs = require("fs");
const tokens = fs.readFileSync(0, "utf-8").trim().split(/\s+/).map(Number);
const n = tokens[0];
const arr = tokens.slice(1, 1 + n);
console.log(findMin(arr));