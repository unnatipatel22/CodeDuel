const fs = require("fs");
try {
  const data = fs.readFileSync(0, "utf-8");
  console.log("child-data:", JSON.stringify(data));
} catch (err) {
  console.error("child-error:", err.message);
}
