import { Router } from 'express';
import { createPracticeRun, getMyPracticeStats } from '../controllers/practice.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/runs', protect, createPracticeRun);
router.get('/me/stats', protect, getMyPracticeStats);

export default router;
