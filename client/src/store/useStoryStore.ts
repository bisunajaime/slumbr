import { create } from 'zustand';
import type { StoryPov, StoryTheme } from '../../../shared/src/schemas/story';

type StoryStatus = 'idle' | 'streaming' | 'done' | 'error';

interface StoryState {
  selectedThemes: StoryTheme[];
  pov: StoryPov;
  withCharacter: boolean;
  withDialogue: boolean;
  customPrompt: string;
  storyText: string;
  status: StoryStatus;
  isFromHistory: boolean;
  savedCount: number;
  provider: string | null;
  toggleTheme: (theme: StoryTheme) => void;
  setPov: (pov: StoryPov) => void;
  toggleCharacter: () => void;
  toggleDialogue: () => void;
  setCustomPrompt: (prompt: string) => void;
  startStream: () => void;
  appendChunk: (chunk: string) => void;
  finishStream: () => void;
  setProvider: (provider: string) => void;
  setError: () => void;
  viewStory: (text: string, themes: StoryTheme[], provider?: string | null) => void;
  notifySessionSaved: () => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  selectedThemes: [],
  pov: 'second',
  withCharacter: false,
  withDialogue: false,
  customPrompt: '',
  storyText: '',
  status: 'idle',
  isFromHistory: false,
  savedCount: 0,
  provider: null,
  toggleTheme: (theme) =>
    set((s) => ({
      selectedThemes: s.selectedThemes.includes(theme)
        ? s.selectedThemes.filter((t) => t !== theme)
        : [...s.selectedThemes, theme],
    })),
  // Reset withCharacter when switching to first person — it's narratively awkward there
  setPov: (pov) => set((s) => ({ pov, withCharacter: pov === 'first' ? false : s.withCharacter })),
  toggleCharacter: () => set((s) => ({ withCharacter: !s.withCharacter })),
  toggleDialogue: () => set((s) => ({ withDialogue: !s.withDialogue })),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  startStream: () => set({ storyText: '', status: 'streaming', isFromHistory: false, provider: null }),
  appendChunk: (chunk) => set((s) => ({ storyText: s.storyText + chunk })),
  finishStream: () => set({ status: 'done' }),
  setProvider: (provider) => set({ provider }),
  setError: () => {
    set({ status: 'error' });
    // Lazy import to avoid circular deps — toast the error then reset to idle
    import('./useToastStore').then(({ useToastStore }) => {
      useToastStore.getState().add("Couldn't generate the story. Please try again.");
    });
    // Reset to idle so the user can try again immediately
    setTimeout(() => set({ status: 'idle' }), 100);
  },
  viewStory: (text, themes, provider = null) => set({ storyText: text, selectedThemes: themes, status: 'done', isFromHistory: true, provider }),
  notifySessionSaved: () => set((s) => ({ savedCount: s.savedCount + 1 })),
  reset: () => set({ selectedThemes: [], pov: 'second', withCharacter: false, withDialogue: false, customPrompt: '', storyText: '', status: 'idle', isFromHistory: false, provider: null }),
}));
