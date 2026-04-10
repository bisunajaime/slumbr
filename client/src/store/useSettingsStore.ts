import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontOption, FontSizeOption } from '../../../shared/src/schemas/settings';

export type TypingSpeed = 'slow' | 'normal' | 'fast';

// chars per tick, ms per tick — tuned for a restful reading feel
export const TYPING_SPEED_CONFIG: Record<TypingSpeed, { chars: number; delay: number }> = {
  slow:   { chars: 2, delay: 55 },
  normal: { chars: 3, delay: 35 },
  fast:   { chars: 5, delay: 18 },
};

interface SettingsState {
  musicMuted: boolean;
  musicVolume: number;
  sleepTimerMinutes: number; // 0 = off
  font: FontOption;
  fontSize: FontSizeOption;
  bionicReading: boolean;
  typingEnabled: boolean;
  typingSpeed: TypingSpeed;
  setMusicMuted: (muted: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSleepTimerMinutes: (minutes: number) => void;
  setFont: (font: FontOption) => void;
  setFontSize: (size: FontSizeOption) => void;
  setBionicReading: (enabled: boolean) => void;
  setTypingEnabled: (enabled: boolean) => void;
  setTypingSpeed: (speed: TypingSpeed) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      musicMuted: false,
      musicVolume: 0.35,
      sleepTimerMinutes: 0,
      font: 'Cormorant Garamond',
      fontSize: 'md',
      bionicReading: false,
      typingEnabled: true,
      typingSpeed: 'normal',
      setMusicMuted: (musicMuted) => set({ musicMuted }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSleepTimerMinutes: (sleepTimerMinutes) => set({ sleepTimerMinutes }),
      setFont: (font) => set({ font }),
      setFontSize: (fontSize) => set({ fontSize }),
      setBionicReading: (bionicReading) => set({ bionicReading }),
      setTypingEnabled: (typingEnabled) => set({ typingEnabled }),
      setTypingSpeed: (typingSpeed) => set({ typingSpeed }),
    }),
    { name: 'slumbr-settings' },
  ),
);
