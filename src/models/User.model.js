import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username max 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [200, "Bio can be at most 200 characters"],
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    totalMatches: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual("winRate").get(function () {
  if (this.totalMatches === 0) return 0;
  return Math.round((this.wins / this.totalMatches) * 100);
});

// Generate a default DiceBear avatar URL for users without a profile picture
userSchema.methods.getAvatarUrl = function () {
  if (this.profilePic) return this.profilePic;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.username)}&backgroundColor=0a0b10&textColor=00f2fe`;
};

const User = mongoose.model("User", userSchema);
export default User;