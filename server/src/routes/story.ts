import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middlewares/auth';
import { generate } from '../controllers/storyController';

const storyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded. Try again in an hour.' },
});

const router = Router();

router.post('/generate', requireAuth, storyLimiter, generate);

export default router;
