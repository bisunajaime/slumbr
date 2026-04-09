import { z } from 'zod';

export const STORY_THEMES = [
  'forest',
  'ocean',
  'cosmos',
  'cabin',
  'anime',
  'fantasy',
  'brainrot',
  'horror-lite',
  'mythology',
] as const;

export type StoryTheme = (typeof STORY_THEMES)[number];

export const STORY_POVS = ['first', 'second', 'third'] as const;
export type StoryPov = (typeof STORY_POVS)[number];

export const GenerateStorySchema = z.object({
  themes: z.array(z.enum(STORY_THEMES)).min(1).max(9),
  pov: z.enum(STORY_POVS).default('second'),
  withCharacter: z.boolean().default(false),
  withDialogue: z.boolean().default(false),
  customPrompt: z.string().max(500).optional(),
});

export type GenerateStoryInput = z.infer<typeof GenerateStorySchema>;
