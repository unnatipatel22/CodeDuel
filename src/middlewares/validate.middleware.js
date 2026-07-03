

export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push("Username must be at least 3 characters");
  }
  if (!email || !email.includes("@")) {
    errors.push("Valid email is required");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  next();
};

export const validateSubmission = (req, res, next) => {
  const { code, language, roomId } = req.body;
  const allowedLanguages = [
    "javascript", "typescript", "python", "cpp", "c", "java",
    "go", "rust", "kotlin", "csharp", "php", "ruby", "swift"
  ];

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Code cannot be empty" });
  }
  if (!language || !allowedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      message: `Language must be one of: ${allowedLanguages.join(", ")}`,
    });
  }
  if (!roomId) {
    return res.status(400).json({ success: false, message: "roomId is required" });
  }
  next();
};
