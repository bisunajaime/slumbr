import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getAuth } from '@clerk/express';
import { requireAuth } from '../middlewares/auth';
import { generate } from '../controllers/storyController';

// Keyed by Clerk user ID — IP switching won't help bypass this
const storyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => getAuth(req).userId!,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded. Try again in an hour.' },
});

const router = Router();

// requireAuth must run before storyLimiter so userId is guaranteed
router.post('/generate', requireAuth, storyLimiter, generate);

export default router;
