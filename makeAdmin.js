import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.model.js";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: node makeAdmin.js <email>");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
    } else {
      console.log(`✅ ${user.username} (${user.email}) is now an admin!`);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
