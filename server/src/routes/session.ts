import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { save, history, favourite } from '../controllers/sessionController';

const router = Router();

router.post('/save', requireAuth, save);
router.get('/history', requireAuth, history);
router.patch('/:id/favourite', requireAuth, favourite);

export default router;
