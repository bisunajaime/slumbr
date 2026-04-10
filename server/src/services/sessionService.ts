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

const PAGE_SIZE = 5;

export async function getHistory(userId: string, offset = 0) {
  // Fetch one extra to determine if there are more pages
  const rows = await prisma.session.findMany({
    where: { userId },
    orderBy: [{ isFavourite: 'desc' }, { createdAt: 'desc' }],
    skip: offset,
    take: PAGE_SIZE + 1,
    select: { id: true, themes: true, customPrompt: true, story: true, provider: true, isFavourite: true, createdAt: true },
  });
  const hasMore = rows.length > PAGE_SIZE;
  return { data: rows.slice(0, PAGE_SIZE), hasMore };
}

export async function toggleFavourite(userId: string, sessionId: string) {
  const session = await prisma.session.findFirst({ where: { id: sessionId, userId } });
  if (!session) return null;
  return prisma.session.update({
    where: { id: sessionId },
    data: { isFavourite: !session.isFavourite },
    select: { id: true, isFavourite: true },
  });
}
