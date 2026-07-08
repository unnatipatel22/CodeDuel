import dotenv from "dotenv";
dotenv.config(); // Must run before reading process.env — ESM imports hoist before module body
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const getOAuthCallbackUrl = (req, provider) => {
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/auth/${provider}/callback`;
  }

  const forwardedProto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const forwardedHost = req.headers["x-forwarded-host"] || req.get("host") || "localhost:5000";
  return `${forwardedProto}://${forwardedHost}/api/auth/${provider}/callback`;
};

/* ── Google ── */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google"), null);

          let user = await User.findOne({ email });
          if (!user) {
            const username =
              profile.displayName?.replace(/\s+/g, "").toLowerCase().slice(0, 18) ||
              `user${Date.now()}`;
            user = await User.create({
              username: username + Math.floor(Math.random() * 100),
              email,
              password: `google_${profile.id}_${Date.now()}`, // random password, no normal login
              profilePic: profile.photos?.[0]?.value || "",
            });
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)");
}

/* ── GitHub ── */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value ||
            `github_${profile.id}@codeduel.local`;

          let user = await User.findOne({ email });
          if (!user) {
            const username =
              (profile.username || `ghuser${profile.id}`).slice(0, 18);
            user = await User.create({
              username: username + Math.floor(Math.random() * 100),
              email,
              password: `github_${profile.id}_${Date.now()}`,
              profilePic: profile.photos?.[0]?.value || "",
            });
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  GitHub OAuth not configured (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET missing)");
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * After successful OAuth, redirect to frontend with JWT token
 * Frontend URL receives: /oauth-callback?token=...&user=...
 */
export const oauthCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!req.user) {
    return res.redirect(`${frontendUrl}/oauth-callback?error=oauth_failed`);
  }
  const token = generateToken(req.user._id);
  const user = {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    profilePic: req.user.profilePic,
    wins: req.user.wins,
    losses: req.user.losses,
    totalMatches: req.user.totalMatches,
    isAdmin: req.user.isAdmin,
    age: req.user.age,
    profession: req.user.profession,
    yearOfStudy: req.user.yearOfStudy,
  };
  const encoded = encodeURIComponent(JSON.stringify(user));
  res.redirect(`${frontendUrl}/oauth-callback?token=${token}&user=${encoded}`);
};

export default passport;
