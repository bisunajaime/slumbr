import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './StoryHistory.scss';
import { useStoryStore } from '../../store/useStoryStore';
import { useToastStore } from '../../store/useToastStore';
import type { StoryTheme } from '../../../../shared/src/schemas/story';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

interface Session {
  id: string;
  themes: StoryTheme[];
  customPrompt: string | null;
  story: string;
  provider: string | null;
  createdAt: string;
}

const THEME_ICONS: Record<StoryTheme, string> = {
  forest:        '🌲',
  ocean:         '🌊',
  cosmos:        '✨',
  cabin:         '🪵',
  anime:         '🌸',
  fantasy:       '🌙',
  brainrot:      '🌀',
  'horror-lite': '🚪',
  mythology:     '🏛️',
};

function extractTitle(story: string): string {
  return story.split('\n')[0] ?? '';
}

function extractPreview(story: string): string {
  const lines = story.split('\n').filter(Boolean);
  // skip the title line, grab the first paragraph
  const body = lines.slice(1).join(' ').trim();
  return body.length > 120 ? body.slice(0, 120).trimEnd() + '…' : body;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function StoryHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const viewStory = useStoryStore((s) => s.viewStory);
  const savedCount = useStoryStore((s) => s.savedCount);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/session/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) return;
        const { data } = await res.json() as { data: Session[] };
        setSessions(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        useToastStore.getState().add("Couldn't load your story history.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [getToken, savedCount]);

  if (loading) {
    return (
      <section className="story-history">
        <h2 className="story-history__heading">your stories</h2>
        <div className="story-history__grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="story-card story-card--skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <section className="story-history">
      <h2 className="story-history__heading">your stories</h2>
      <div className="story-history__grid">
        {sessions.map((s) => (
          <button
            key={s.id}
            className="story-card"
            onClick={() => viewStory(s.story, s.themes, s.provider)}
          >
            <div className="story-card__meta">
              <span className="story-card__theme">
                {s.themes.map((t) => (
                  <span key={t} aria-hidden>{THEME_ICONS[t]}</span>
                ))}
                {s.themes.join(' · ')}
              </span>
              <span className="story-card__time">{timeAgo(s.createdAt)}</span>
            </div>
            <p className="story-card__title">{extractTitle(s.story)}</p>
            <p className="story-card__preview">{extractPreview(s.story)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
