import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useStoryStore } from '../store/useStoryStore';
import { useToastStore } from '../store/useToastStore';
import type { StoryTheme } from '../../../shared/src/schemas/story';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

export function useSaveSession() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { getToken } = useAuth();

  const save = async (themes: StoryTheme[], story: string, customPrompt?: string, provider?: string | null) => {
    setSaveStatus('saving');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/session/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ themes, story, customPrompt: customPrompt || undefined, provider: provider ?? undefined }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
      useStoryStore.getState().notifySessionSaved();
    } catch {
      setSaveStatus('error');
      useToastStore.getState().add("Couldn't save the story. Tap the button to try again.");
    }
  };

  return { saveStatus, save };
}
