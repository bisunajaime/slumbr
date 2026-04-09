import { Router } from 'express';
import storyRoutes from './story';
import sessionRoutes from './session';

const router = Router();

router.use('/story', storyRoutes);
router.use('/session', sessionRoutes);

export default router;
