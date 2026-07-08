const path = require("path");
(async () => {
  const mod = await import(pathToFileURL(path.join(process.cwd(), "src/utils/judge0.js")).href);
  const code = "function findMin(nums){ return Math.min(...nums); }";
  const input = "5\n3 4 5 1 2";
  const wrapped = mod.maybeWrapJSCode(code, input);
  console.log("wrapped code:\n", wrapped);
  const fs = require("fs");
  fs.writeFileSync("tmpWrap.cjs", wrapped, "utf8");
  const { spawnSync } = require("child_process");
  const res = spawnSync(process.execPath, ["tmpWrap.cjs"], { input, encoding: "utf8" });
  console.log(JSON.stringify({ stdout: res.stdout, stderr: res.stderr, status: res.status, error: res.error && res.error.message }));
})();
