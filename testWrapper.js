const fs = require("fs");
const script = `function findMin(nums) { return Math.min(...nums); }
const fs2 = require("fs");
const tokens = fs2.readFileSync(0, "utf-8").trim().split(/\s+/).map(Number);
const n = tokens[0];
const arr = tokens.slice(1, 1 + n);
console.log(findMin(arr));`;
fs.writeFileSync("tmp.cjs", script, "utf8");
const { spawnSync } = require("child_process");
const res = spawnSync(process.execPath, ["tmp.cjs"], { input: "5\n3 4 5 1 2", encoding: "utf8" });
console.log(JSON.stringify({ stdout: res.stdout, stderr: res.stderr, error: res.error && res.error.message, status: res.status }));
