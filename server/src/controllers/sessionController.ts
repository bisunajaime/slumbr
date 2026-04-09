import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { z } from 'zod';
import { STORY_THEMES } from '@slumbr/shared';
import { saveSession, getHistory } from '../services/sessionService';

const SaveSchema = z.object({
  themes: z.array(z.enum(STORY_THEMES)).min(1),
  story: z.string().min(1).max(12000),
  customPrompt: z.string().max(500).optional(),
  provider: z.string().max(50).optional(),
});

export async function save(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    const input = SaveSchema.parse(req.body);
    const session = await saveSession(userId, input.themes, input.story, input.customPrompt, input.provider);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
    const sessions = await getHistory(userId);
    res.json({ success: true, data: sessions });
  } catch {
    // DB not available — return empty list rather than a 500
    res.json({ success: true, data: [] });
  }
}
