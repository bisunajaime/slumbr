import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { GenerateStorySchema } from '@slumbr/shared';
import { generateStory } from '../services/storyService';

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);
    const input = GenerateStorySchema.parse(req.body);

    const { stream, provider } = await generateStory(input.themes, input.pov, input.withCharacter, input.withDialogue, input.storyLength, input.customPrompt, input.continuationContext);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = stream.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.write(`data: [DONE:${provider}]\n\n`); res.end(); return; }
      res.write(`data: ${JSON.stringify({ text: value })}\n\n`);
      await pump();
    };

    req.on('close', () => reader.cancel());
    await pump();
  } catch (err) {
    next(err);
  }
}
