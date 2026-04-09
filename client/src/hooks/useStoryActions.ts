import { useAuth } from '@clerk/clerk-react';
import { useStoryStore } from '../store/useStoryStore';
import { useSettingsStore, TYPING_SPEED_CONFIG } from '../store/useSettingsStore';
import type { StoryPov, StoryTheme } from '../../../shared/src/schemas/story';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

async function authHeaders(token: string | null): Promise<Record<string, string>> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Typewriter drainer — buffers all incoming SSE text and releases it gently,
// character-group by character-group, so the story unfolds at a readable pace
// instead of arriving in jarring LLM-speed bursts.
function createTypewriterDrainer(
  appendChunk: (t: string) => void,
  finishStream: () => void,
  chars: number,
  baseDelay: number,
) {
  let queue = '';
  let streamEnded = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function tick() {
    if (queue.length === 0) {
      if (streamEnded) { finishStream(); return; }
      timer = setTimeout(tick, 40);
      return;
    }

    const chunk = queue.slice(0, chars);
    queue = queue.slice(chars);
    appendChunk(chunk);

    // Natural breathing pauses at punctuation
    const last = chunk[chunk.length - 1];
    let delay = baseDelay;
    if ('.!?'.includes(last))       delay = baseDelay * 7; // breath after sentence
    else if (',;:–'.includes(last)) delay = baseDelay * 2.5;

    timer = setTimeout(tick, delay);
  }

  tick();

  return {
    push: (text: string) => { queue += text; },
    done: () => { streamEnded = true; },
    destroy: () => { if (timer) clearTimeout(timer); },
  };
}

async function consumeSSE(res: Response): Promise<void> {
  const { appendChunk, finishStream, setProvider, setError } = useStoryStore.getState();
  const { typingEnabled, typingSpeed } = useSettingsStore.getState();
  if (!res.ok || !res.body) { setError(); return; }

  const { chars, delay } = TYPING_SPEED_CONFIG[typingSpeed];
  const drainer = typingEnabled
    ? createTypewriterDrainer(appendChunk, finishStream, chars, delay)
    : null;
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
        if (payload.startsWith('[DONE')) {
          const match = payload.match(/\[DONE:([^\]]+)\]/);
          if (match?.[1]) setProvider(match[1]);
          drainer ? drainer.done() : finishStream();
          return;
        }
        try {
          const { text } = JSON.parse(payload) as { text: string };
          drainer ? drainer.push(text) : appendChunk(text);
        } catch { /* skip malformed line */ }
      }
    }
    drainer ? drainer.done() : finishStream();
  } catch {
    drainer?.destroy();
    setError();
  }
}

export function useStoryActions() {
  const { getToken } = useAuth();

  const generate = async (themes: StoryTheme[], pov: StoryPov, withCharacter: boolean, withDialogue: boolean, customPrompt?: string) => {
    const token = await getToken();
    useStoryStore.getState().startStream();
    try {
      const res = await fetch(`${API_BASE}/story/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...await authHeaders(token),
        },
        body: JSON.stringify({ themes, pov, withCharacter, withDialogue, customPrompt: customPrompt || undefined }),
      });
      await consumeSSE(res);
    } catch {
      useStoryStore.getState().setError();
    }
  };

  return { generate };
}
