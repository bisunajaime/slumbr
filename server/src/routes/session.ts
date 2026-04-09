import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { save, history } from '../controllers/sessionController';

const router = Router();

router.post('/save', requireAuth, save);
router.get('/history', requireAuth, history);

export default router;
