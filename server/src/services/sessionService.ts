import { prisma } from '../config/prisma';
import { StoryTheme } from '@slumbr/shared';

export async function saveSession(
  userId: string,
  themes: StoryTheme[],
  story: string,
  customPrompt?: string,
  provider?: string,
) {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  return prisma.session.create({
    data: { userId, themes, story, customPrompt: customPrompt ?? null, provider: provider ?? null },
  });
}

export async function getHistory(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, themes: true, customPrompt: true, story: true, provider: true, createdAt: true },
  });
}
