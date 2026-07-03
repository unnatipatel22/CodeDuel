import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

/**
 * requireAdmin middleware
 * Verifies JWT token AND checks user.isAdmin === true.
 * Must be used AFTER the existing `protect` middleware.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Support both: used after protect (req.user exists) or standalone
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authenticated." });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found." });
      }
      req.user = user;
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};
