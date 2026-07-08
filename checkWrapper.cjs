const fs = require("fs");
const code = "function findMin(nums){ return Math.min(...nums); }";
const input = "5\n3 4 5 1 2";
const raw = input.trim();
const tokens = raw.split(/\s+/).filter(Boolean);
const allNumeric = tokens.length > 0 && tokens.every((t) => /^-?\d+$/.test(t));
const argName = 'nums';
const isStringArray = false;
const wrapper = allNumeric && tokens.length > 1
  ? `const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\s+/).filter(Boolean).map(Number);\nconst count = tokens[0];\nconst arr = tokens.slice(1, 1 + count);\nconsole.log(findMin(arr));`
  : null;
console.log('wrapper=');
console.log(wrapper);
const script = `${code}\n${wrapper}`;
fs.writeFileSync('tmpWrap.cjs', script, 'utf8');
const { spawnSync } = require('child_process');
const res = spawnSync(process.execPath, ['tmpWrap.cjs'], { input, encoding: 'utf8' });
console.log(JSON.stringify({ stdout: res.stdout, stderr: res.stderr, status: res.status, error: res.error && res.error.message }));
