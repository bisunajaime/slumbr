import type { StoryTheme } from '../../../shared/src/schemas/story';
import { useStoryStore } from '../store/useStoryStore';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

async function consumeSSE(res: Response): Promise<void> {
  const { appendChunk, finishStream, setError } = useStoryStore.getState();
  if (!res.ok || !res.body) { setError(); return; }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') { finishStream(); return; }
        try {
          const { text } = JSON.parse(payload) as { text: string };
          appendChunk(text);
        } catch { /* skip malformed line */ }
      }
    }
    finishStream();
  } catch {
    setError();
  }
}

export async function streamStory(theme: StoryTheme, customPrompt?: string): Promise<void> {
  useStoryStore.getState().startStream();
  try {
    const res = await fetch(`${API_BASE}/story/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, customPrompt: customPrompt || undefined }),
      credentials: 'include',
    });
    await consumeSSE(res);
  } catch {
    useStoryStore.getState().setError();
  }
}
