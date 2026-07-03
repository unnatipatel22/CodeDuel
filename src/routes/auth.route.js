import { Router } from "express";
import multer from "multer";
import path from "path";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateRegister, validateLogin } from "../middlewares/validate.middleware.js";

const router = Router();

// Multer storage configuration: files ko server par save karne ke liye
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Files 'uploads' folder me save hongi
    },
    filename: (req, file, cb) => {
        // Unique filename banane ke liye timestamp ka use kiya
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// register route par upload.single('profilePic') add kiya hai, baaki validation same hai
router.post("/register", upload.single("profilePic"), validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);

export default router;