import axios from "axios";


export const LANGUAGE_IDS = {
  javascript: 63,
  typescript: 74,
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  go: 60,
  rust: 73,
  kotlin: 78,
  csharp: 51,
  php: 68,
  ruby: 72,
  swift: 83,
};

const judge0Axios = axios.create({
  baseURL: process.env.JUDGE0_URL,
  headers: {
    "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json",
  },
});


const executeCode = async (code, languageId, input) => {
  try {
    
    const submitRes = await judge0Axios.post("/submissions?base64_encoded=false&wait=true", {
      source_code: code,
      language_id: languageId,
      stdin: input,
    });

    return submitRes.data;
  } catch (error) {
    throw new Error(`Judge0 execution failed: ${error.message}`);
  }
};


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
