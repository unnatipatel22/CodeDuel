import dotenv from 'dotenv';
import connectDB from '../src/db/connect.js';
import User from '../src/models/User.model.js';
import Problem from '../src/models/Problem.model.js';
import PracticeRun from '../src/models/PracticeRun.model.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const user = await User.findOne();
  const problems = await Problem.find({ isActive: true }).limit(6);
  if (!user) {
    console.error('No users found to attach runs to. Create a user first.');
    process.exit(1);
  }
  if (!problems || problems.length === 0) {
    console.error('No problems found to use for seeding.');
    process.exit(1);
  }

  const samples = [];
  for (let i = 0; i < problems.length; i++) {
    samples.push({
      userId: user._id,
      problemId: problems[i]._id,
      topic: (problems[i].tags && problems[i].tags[0]) || 'arrays',
      timeTaken: Math.floor(Math.random() * 600) + 30,
      status: 'completed',
      linesWritten: Math.floor(Math.random() * 200) + 10,
      language: ['javascript','python','cpp'][Math.floor(Math.random()*3)],
    });
  }

  await PracticeRun.insertMany(samples);
  const total = await PracticeRun.countDocuments({ userId: user._id });
  console.log(`Inserted ${samples.length} practice runs for user ${user.username}. Total runs for user: ${total}`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
