import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Star } from 'lucide-react';
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
  isFavourite: boolean;
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
  const body = lines.slice(1).join(' ').trim();
  return body.length > 140 ? body.slice(0, 140).trimEnd() + '…' : body;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PAGE_SIZE = 5;

export function StoryHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { getToken } = useAuth();
  const viewStory = useStoryStore((s) => s.viewStory);
  const savedCount = useStoryStore((s) => s.savedCount);

  const fetchPage = async (offset: number, signal?: AbortSignal) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/session/history?offset=${offset}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json() as Promise<{ data: Session[]; hasMore: boolean }>;
  };

  const toggleFavourite = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions((prev) =>
      prev.map((s) => s.id === sessionId ? { ...s, isFavourite: !s.isFavourite } : s)
        .sort((a, b) => (b.isFavourite ? 1 : 0) - (a.isFavourite ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/session/${sessionId}/favourite`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      setSessions((prev) =>
        prev.map((s) => s.id === sessionId ? { ...s, isFavourite: !s.isFavourite } : s)
      );
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data, hasMore: more } = await fetchPage(sessions.length);
      setSessions((prev) => [...prev, ...data]);
      setHasMore(more);
    } catch {
      useToastStore.getState().add("Couldn't load more stories.");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setSessions([]);
    (async () => {
      try {
        const { data, hasMore: more } = await fetchPage(0, controller.signal);
        setSessions(data);
        setHasMore(more);
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
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
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
          <div
            key={s.id}
            className={`story-card ${s.isFavourite ? 'is-favourite' : ''}`}
            onClick={() => viewStory(s.story, s.themes, s.provider)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') viewStory(s.story, s.themes, s.provider); }}
            aria-label={`Read: ${extractTitle(s.story)}`}
          >
            <div className="story-card__top">
              <span className="story-card__theme">
                {s.themes.map((t) => (
                  <span key={t} className="story-card__theme-item">
                    <span aria-hidden>{THEME_ICONS[t]}</span>
                    <span>{t}</span>
                  </span>
                ))}
              </span>
              <button
                className={`story-card__star ${s.isFavourite ? 'is-starred' : ''}`}
                onClick={(e) => toggleFavourite(e, s.id)}
                aria-label={s.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                aria-pressed={s.isFavourite}
              >
                <Star size={14} strokeWidth={1.5} />
              </button>
            </div>

            <h3 className="story-card__title">{extractTitle(s.story)}</h3>
            <p className="story-card__preview">{extractPreview(s.story)}</p>

            <div className="story-card__footer">
              <span className="story-card__time">{timeAgo(s.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          className="story-history__load-more"
          onClick={loadMore}
          disabled={loadingMore}
          aria-label="Load more stories"
        >
          {loadingMore ? <><span className="story-history__load-more-dot" /><span className="story-history__load-more-dot" /><span className="story-history__load-more-dot" /></> : 'Load more'}
        </button>
      )}
    </section>
  );
}
