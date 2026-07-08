import PracticeRun from '../models/PracticeRun.model.js';
import { AppError } from '../middlewares/error.middleware.js';

export const createPracticeRun = async (req, res, next) => {
  try {
    const { problemId, topic, timeTaken, status, linesWritten, language } = req.body;
    if (!problemId || typeof timeTaken !== 'number') return next(new AppError('problemId and timeTaken required', 400));
    const run = await PracticeRun.create({
      userId: req.user._id,
      problemId,
      topic: topic || 'all',
      timeTaken,
      status: status || 'completed',
      linesWritten: linesWritten || 0,
      language: language || null,
    });
    res.status(201).json({ success: true, run });
  } catch (err) {
    next(err);
  }
};

export const getMyPracticeStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const runs = await PracticeRun.find({ userId: uid }).sort({ createdAt: -1 }).limit(200).lean();

    // Aggregate simple per-topic stats
    const byTopic = {};
    runs.forEach(r => {
      const t = r.topic || 'all';
      if (!byTopic[t]) byTopic[t] = { total: 0, bestTime: Infinity, lastRun: null };
      byTopic[t].total += 1;
      if (typeof r.timeTaken === 'number' && r.timeTaken < byTopic[t].bestTime) byTopic[t].bestTime = r.timeTaken;
      byTopic[t].lastRun = r;
    });

    Object.keys(byTopic).forEach(k => { if (byTopic[k].bestTime === Infinity) byTopic[k].bestTime = null; });

    res.status(200).json({ success: true, stats: { totalRuns: runs.length, byTopic, recent: runs.slice(0, 20) } });
  } catch (err) {
    next(err);
  }
};
