import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

export const LANGUAGE_IDS = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  cpp: "cpp",
  c: "c",
  java: "java",
  go: "go",
  rust: "rust",
  kotlin: "kotlin",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  swift: "swift",
};

// Piston API configuration
const PISTON_API_URL = "https://api.piston.rocks/execute";

const pistonAxios = axios.create({
  baseURL: "https://api.piston.rocks",
  headers: {
    "Content-Type": "application/json",
  },
});


const shouldWrapJS = (code) => {
  return !/require\(|fs\.readFileSync|process\.stdin|console\.log|module\.exports/.test(code);
};

const parseJSFunctionSignature = (code) => {
  const fnDecl = code.match(/function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)/);
  if (fnDecl) {
    return { name: fnDecl[1], args: fnDecl[2].split(",").map((arg) => arg.trim()).filter(Boolean) };
  }
  const arrowFn = code.match(/(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>/);
  if (arrowFn) {
    return { name: arrowFn[1], args: arrowFn[2].split(",").map((arg) => arg.trim()).filter(Boolean) };
  }
  return null;
};

const buildJSWrapper = (signature, input) => {
  const args = signature.args;
  const raw = input.trim();
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tokens = raw.split(/\s+/).filter(Boolean);
  const allNumeric = tokens.length > 0 && tokens.every((t) => /^-?\d+$/.test(t));
  const firstLineNumeric = lines.length > 0 && /^-?\d+$/.test(lines[0]);
  const isStringArray = firstLineNumeric && lines.slice(1).some((line) => /[^0-9\s]/.test(line));
  const argName = args[0] ? args[0].toLowerCase() : "";
  const argLooksLikeArray = ["num", "nums", "arr", "array", "list", "vector", "values", "items", "nodes", "coords"].some((term) => argName === term || argName.endsWith(term));
  const argLooksLikeString = ["str", "string", "s", "word", "text", "sentence", "input", "path", "name"].some((term) => argName === term || argName.endsWith(term));

  if (args.length === 1) {
    if (argLooksLikeString && !isStringArray && !argLooksLikeArray) {
      return `const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconsole.log(${signature.name}(input));`;
    }

    if (isStringArray) {
      return `const fs = require("fs");\nconst lines = fs.readFileSync(0, "utf-8").trim().split(/\r?\n/);\nconst n = Number(lines[0]);\nconst arr = lines.slice(1, 1 + n);\nconsole.log(${signature.name}(arr));`;
    }

    if (allNumeric && tokens.length > 1) {
      return `const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).filter(Boolean).map(Number);\nconst count = tokens[0];\nconst arr = tokens.slice(1, 1 + count);\nconsole.log(${signature.name}(arr));`;
    }

    if (argLooksLikeArray && tokens.length > 1) {
      return `const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).filter(Boolean).map(Number);\nconsole.log(${signature.name}(tokens));`;
    }

    return `const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nconsole.log(${signature.name}(input));`;
  }

  if (args.length === 2 && allNumeric && tokens.length > 2) {
    return `const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).filter(Boolean).map(Number);\nconst count = tokens[0];\nconst arr = tokens.slice(1, 1 + count);\nconst second = tokens[1 + count];\nconsole.log(${signature.name}(arr, second));`;
  }

  return null;
};

const maybeWrapJSCode = (code, input) => {
  if (code.includes('require("fs")') || code.includes('console.log')) {
    return code; 
  }
  
  const hasSolutionClass = /class\s+Solution/.test(code);
  const fnMatch = code.match(/(?:function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\([^)]*\)\s*\{)/);
  if (!fnMatch) return code;

  let fnName = "";
  let args = [];
  
  if (hasSolutionClass) {
      const methodMatch = code.match(/([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(([^)]*)\)\s*\{/);
      if (methodMatch) {
          fnName = methodMatch[1];
          args = methodMatch[2].split(',').filter(Boolean);
      }
  } else {
      fnName = fnMatch[1];
      const sigMatch = code.match(new RegExp(`function\\s+${fnName}\\s*\\(([^)]*)\\)`));
      if (sigMatch) {
          args = sigMatch[1].split(',').filter(Boolean);
      }
  }
  
  const caller = hasSolutionClass ? `new Solution().${fnName}` : fnName;

  const wrapper = `
const fs = require('fs');
function __run_wrapper() {
    let raw_input = "";
    try {
        raw_input = fs.readFileSync(0, 'utf-8').trim();
    } catch(e) { return; }
    if (!raw_input) return;
    
    const tokens = raw_input.split(/\\s+/);
    const all_numeric = tokens.every(t => !isNaN(t) && t !== "");
    
    let res;
    if (${args.length} === 1) {
        if (all_numeric && tokens.length > 1) {
            res = ${caller}(tokens.slice(1).map(Number));
        } else if (all_numeric && tokens.length === 1) {
            res = ${caller}(Number(tokens[0]));
        } else {
            res = ${caller}(raw_input);
        }
    } else if (${args.length} === 2 && all_numeric && tokens.length > 2) {
        const count = Number(tokens[0]);
        const arr = tokens.slice(1, 1 + count).map(Number);
        const second = Number(tokens[1 + count]);
        res = ${caller}(arr, second);
    }
    
    if (Array.isArray(res)) {
        console.log(res.join(" "));
    } else if (res !== undefined) {
        console.log(res);
    }
}
__run_wrapper();
`;
  return `${code}\n${wrapper}`;
};

const maybeWrapPythonCode = (code, input) => {
  if (/import sys|sys\.stdin|print\s*\(/.test(code)) return code;
  
  const hasSolutionClass = /class\s+Solution/.test(code);
  const fnDecl = code.match(/def\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\):/);
  if (!fnDecl) return code;
  
  const fnName = fnDecl[1];
  let argsStr = fnDecl[2];
  let args = argsStr.split(",").map(a => a.trim()).filter(Boolean);
  
  if (hasSolutionClass && args[0] === 'self') {
      args.shift();
  }
  
  const caller = hasSolutionClass ? `Solution().${fnName}` : fnName;

  const wrapper = `
import sys
def __run_wrapper():
    raw_input = sys.stdin.read().strip()
    if not raw_input:
        return
    tokens = raw_input.split()
    all_numeric = all(t.lstrip('-').isdigit() for t in tokens)
    
    if ${args.length} == 1:
        if all_numeric and len(tokens) > 1:
            res = ${caller}([int(x) for x in tokens[1:]])
        elif all_numeric and len(tokens) == 1:
            res = ${caller}(int(tokens[0]))
        else:
            res = ${caller}(raw_input)
    elif ${args.length} == 2 and all_numeric and len(tokens) > 2:
        count = int(tokens[0])
        arr = [int(x) for x in tokens[1:1+count]]
        second = int(tokens[1+count])
        res = ${caller}(arr, second)
    
    if isinstance(res, list):
        print(" ".join(map(str, res)))
    else:
        print(res)

if __name__ == '__main__':
    __run_wrapper()
`;
  return `${code}\n${wrapper}`;
};

const maybeWrapCppCode = (code, input) => {
  if (code.includes('int main')) return code;

  const matches = [...code.matchAll(/((?:vector\s*<\s*int\s*>|int|string|void|bool|long|double|float))\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/g)];
  if (matches.length === 0) return code;
  
  const fnMatch = matches[matches.length - 1];
  const returnType = fnMatch[1].replace(/\s+/g, '');
  const fnName = fnMatch[2];
  const argsStr = fnMatch[3];
  const args = argsStr.split(',').filter(Boolean);
  
  const hasClass = code.includes('class Solution');
  
  let wrapper = `\n\nint main() {\n`;
  wrapper += `    int count;\n    if (!(cin >> count)) return 0;\n`;
  wrapper += `    vector<int> arr(count);\n    for(int i=0; i<count; i++) cin >> arr[i];\n`;
  
  const caller = hasClass ? `Solution().${fnName}` : `${fnName}`;
  
  if (args.length === 2) {
      wrapper += `    int second;\n    cin >> second;\n`;
      wrapper += `    auto res = ${caller}(arr, second);\n`;
  } else {
      wrapper += `    auto res = ${caller}(arr);\n`;
  }
  
  if (returnType.includes('vector')) {
      wrapper += `    for(int i=0; i<res.size(); i++) cout << res[i] << (i == res.size()-1 ? "" : " ");\n    cout << endl;\n`;
  } else {
      wrapper += `    cout << res << endl;\n`;
  }
  
  wrapper += `    return 0;\n}\n`;
  
  let finalCode = code;
  if (!code.includes('<iostream>')) finalCode = `#include <iostream>\n` + finalCode;
  if (!code.includes('<vector>')) finalCode = `#include <vector>\n` + finalCode;
  if (!code.includes('using namespace std;')) finalCode = `using namespace std;\n` + finalCode;
  
  return finalCode + wrapper;
};

const maybeWrapJavaCode = (code, input) => {
  if (code.includes('public static void main')) return code;

  code = code.replace(/public\s+class\s+Solution/, 'class Solution');

  const matches = [...code.matchAll(/(int\[\]|int|String|boolean|void|long|double|float)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/g)];
  if (matches.length === 0) return code;
  
  const fnMatch = matches[matches.length - 1];
  const returnType = fnMatch[1];
  const fnName = fnMatch[2];
  const argsStr = fnMatch[3];
  const args = argsStr.split(',').filter(Boolean);
  
  let wrapper = `\npublic class Main {\n    public static void main(String[] args) {\n`;
  wrapper += `        java.util.Scanner sc = new java.util.Scanner(System.in);\n`;
  wrapper += `        if (!sc.hasNextInt()) return;\n`;
  wrapper += `        int count = sc.nextInt();\n`;
  wrapper += `        int[] arr = new int[count];\n`;
  wrapper += `        for (int i = 0; i < count; i++) arr[i] = sc.nextInt();\n`;
  
  const caller = `new Solution().${fnName}`;
  
  if (args.length === 2) {
      wrapper += `        int second = sc.nextInt();\n`;
      wrapper += `        ${returnType} res = ${caller}(arr, second);\n`;
  } else {
      wrapper += `        ${returnType} res = ${caller}(arr);\n`;
  }
  
  if (returnType.includes('[]')) {
      wrapper += `        for (int i = 0; i < res.length; i++) {\n`;
      wrapper += `            System.out.print(res[i] + (i == res.length - 1 ? "" : " "));\n`;
      wrapper += `        }\n`;
      wrapper += `        System.out.println();\n`;
  } else {
      wrapper += `        System.out.println(res);\n`;
  }
  
  wrapper += `    }\n}\n`;
  
  return code + wrapper;
};

const executeCode = async (code, languageId, input) => {
  if (languageId === "javascript") {
    code = maybeWrapJSCode(code, input);
  } else if (languageId === "python") {
    code = maybeWrapPythonCode(code, input);
  } else if (languageId === "cpp" || languageId === "c") {
    code = maybeWrapCppCode(code, input);
  } else if (languageId === "java") {
    code = maybeWrapJavaCode(code, input);
  }

  // Try Piston API first
  try {
    const pistonResponse = await pistonAxios.post("/execute", {
      language: languageId,
      version: "*",
      files: [
        {
          name: "solution",
          content: code,
        }
      ],
      stdin: input,
    });

    const { run } = pistonResponse.data;
    
    return {
      stdout: (run?.stdout || "").trim(),
      stderr: (run?.stderr || "").trim(),
      status: { id: 3, description: run?.code === 0 ? "Accepted" : "Runtime Error" },
      time: run?.wall || 0,
    };
  } catch (pistonError) {
    // Fallback to local execution if Piston API fails
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codeduel-"));
    let result;

    try {
      if (languageId === "javascript") {
        const filePath = path.join(tempDir, "solution.cjs");
        fs.writeFileSync(filePath, code, "utf-8");
        result = spawnSync(process.execPath, [filePath], {
          input, encoding: "utf-8", timeout: 10000,
        });
      } else if (languageId === "python") {
        const filePath = path.join(tempDir, "solution.py");
        fs.writeFileSync(filePath, code, "utf-8");
        result = spawnSync("python", [filePath], {
          input, encoding: "utf-8", timeout: 10000,
        });
      } else if (languageId === "cpp" || languageId === "c") {
        const filePath = path.join(tempDir, "solution.cpp");
        const outPath = path.join(tempDir, "solution.exe");
        fs.writeFileSync(filePath, code, "utf-8");
        const compile = spawnSync("g++", [filePath, "-o", outPath], { encoding: "utf-8" });
        if (compile.error || compile.status !== 0) {
          throw new Error("Compilation failed: " + (compile.stderr || compile.stdout || ""));
        }
        result = spawnSync(outPath, [], {
          input, encoding: "utf-8", timeout: 10000,
        });
      } else if (languageId === "java") {
        const filePath = path.join(tempDir, "Main.java");
        fs.writeFileSync(filePath, code, "utf-8");
        const compile = spawnSync("javac", [filePath], { encoding: "utf-8" });
        if (compile.error || compile.status !== 0) {
          throw new Error("Compilation failed: " + (compile.stderr || compile.stdout || ""));
        }
        result = spawnSync("java", ["-cp", tempDir, "Main"], {
          input, encoding: "utf-8", timeout: 10000,
        });
      } else {
        throw new Error(`Local execution for language ${languageId} is not supported.`);
      }

      if (result.error) {
        if (result.error.code === 'ETIMEDOUT') {
          throw new Error("Execution Time Limit Exceeded");
        }
        throw new Error(result.error.message || "Runtime Error");
      }
      
      if (result.status !== 0) {
        throw new Error(result.stderr || "Runtime Error");
      }
      
      return {
        stdout: (result.stdout || "").trim(),
        status: { id: 3, description: "Accepted" },
        time: result.duration || 0,
      };
    } finally {
      // Cleanup temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
};

export { maybeWrapJSCode };

export const runAllTestCases = async (code, language, testCases) => {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) throw new Error("Unsupported language");

  let passed = 0;
  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await executeCode(code, languageId, testCase.input);

      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const isCorrect = actualOutput === expectedOutput;

      if (isCorrect) passed++;

      results.push({
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed: isCorrect,
        statusId: result.status?.id,
        statusDesc: result.status?.description,
        time: result.time,
      });
    } catch (err) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        error: err.message,
      });
    }
  }

  return {
    passed,
    total: testCases.length,
    allPassed: passed === testCases.length,
    results,
  };
};
