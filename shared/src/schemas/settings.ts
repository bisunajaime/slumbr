import { z } from 'zod';

export const FONT_OPTIONS = [
  'Cormorant Garamond',
  'Playfair Display',
  'EB Garamond',
  'Lora',
  'Merriweather',
  'Spectral',
  'Crimson Pro',
  'DM Serif Display',
] as const;

export const FONT_SIZE_OPTIONS = ['sm', 'md', 'lg', 'xl'] as const;

export const UpdateSettingsSchema = z.object({
  musicMuted: z.boolean().optional(),
  font: z.enum(FONT_OPTIONS).optional(),
  fontSize: z.enum(FONT_SIZE_OPTIONS).optional(),
  bionicReading: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type FontOption = (typeof FONT_OPTIONS)[number];
export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number];
