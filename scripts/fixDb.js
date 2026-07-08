import mongoose from 'mongoose';
import Problem from '../src/models/problem.model.js';

const URI = 'mongodb+srv://unnatip377_db_user:NBM9xVickgljyiqQ@cluster0.ubwlaew.mongodb.net/codeduel?retryWrites=true&w=majority&appName=Cluster0';

async function fixStarterCodes() {
  await mongoose.connect(URI);
  console.log("Connected to DB.");

  const problems = await Problem.find({});
  
  for (const p of problems) {
    let changed = false;
    
    if (p.starterCode && p.starterCode.javascript) {
      if (!p.starterCode.javascript.includes('class Solution') && p.starterCode.javascript.includes('function ')) {
        const fnName = p.starterCode.javascript.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/)[1];
        const args = p.starterCode.javascript.match(/function\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*\(([^)]*)\)/)[1];
        p.starterCode.javascript = `class Solution {\n    ${fnName}(${args}) {\n        \n    }\n}`;
        changed = true;
      }
    }
    
    if (p.starterCode && p.starterCode.python) {
      if (!p.starterCode.python.includes('class Solution')) {
        const match = p.starterCode.python.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/);
        if (match) {
          const fnName = match[1];
          const args = match[2];
          p.starterCode.python = `class Solution:\n    def ${fnName}(self, ${args}):\n        pass`;
          changed = true;
        }
      }
    }
    
    if (p.starterCode && p.starterCode.cpp) {
      if (!p.starterCode.cpp.includes('class Solution')) {
        const match = p.starterCode.cpp.match(/((?:vector\s*<\s*int\s*>|int|string|void|bool|long|double|float))\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
        if (match) {
          const ret = match[1];
          const fnName = match[2];
          const args = match[3];
          p.starterCode.cpp = `#include<bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${ret} ${fnName}(${args}) {\n        \n    }\n};`;
          changed = true;
        }
      }
    }
    
    if (changed) {
      await Problem.updateOne({ _id: p._id }, { $set: { starterCode: p.starterCode } });
      console.log(`Updated ${p.title}`);
    }
  }
  
  console.log("Done.");
  process.exit(0);
}

fixStarterCodes();
