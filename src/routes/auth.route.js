import { Router } from "express";
import multer from "multer";
import passport from "passport";
import "../config/passport.js"; // registers strategies
import { register, login, getMe } from "../controllers/auth.controller.js";
import { oauthCallback, getOAuthCallbackUrl } from "../config/passport.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRegister, validateLogin } from "../middlewares/validate.middleware.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/* Standard auth */
router.post("/register", upload.single("profilePic"), validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);

/* Tells frontend which OAuth providers are actually configured */
router.get("/providers", (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

const frontendRedirect = process.env.FRONTEND_URL || "http://localhost:5173";

/* Google OAuth */
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendRedirect}/oauth-callback?error=google_not_configured`);
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    callbackURL: getOAuthCallbackUrl(req, "google"),
  })(req, res, next);
});
router.get("/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${frontendRedirect}/oauth-callback?error=google_not_configured`);
  }
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${frontendRedirect}/oauth-callback?error=google_failed`,
    callbackURL: getOAuthCallbackUrl(req, "google"),
  })(req, res, next);
}, oauthCallback);

/* GitHub OAuth */
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${frontendRedirect}/oauth-callback?error=github_not_configured`);
  }
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
    callbackURL: getOAuthCallbackUrl(req, "github"),
  })(req, res, next);
});
router.get("/github/callback", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.redirect(`${frontendRedirect}/oauth-callback?error=github_not_configured`);
  }
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${frontendRedirect}/oauth-callback?error=github_failed`,
    callbackURL: getOAuthCallbackUrl(req, "github"),
  })(req, res, next);
}, oauthCallback);

export default router;