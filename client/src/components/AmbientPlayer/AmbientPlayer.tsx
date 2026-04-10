import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import track1 from '../../assets/music/Below_the_Linen_Sheet.mp3';
import track2 from '../../assets/music/Still_Surface_Tension.mp3';
import track3 from '../../assets/music/Submerged_Light.mp3';

const TRACKS = [track1, track2, track3];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Global singleton — rendered once at app root, never unmounts
export function AmbientPlayer() {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<string[]>([]);
  const indexRef    = useRef(0);
  const musicMuted   = useSettingsStore((s) => s.musicMuted);
  const musicVolume  = useSettingsStore((s) => s.musicVolume);

  useEffect(() => {
    if (audioRef.current) return;

    // Shuffle and pick a random starting position so every reload
    // begins on a different track.
    const playlist = shuffled(TRACKS);
    const startIndex = Math.floor(Math.random() * playlist.length);
    playlistRef.current = playlist;
    indexRef.current = startIndex;

    const audio = new Audio(playlist[startIndex]);
    audio.volume = useSettingsStore.getState().musicVolume;
    audio.preload = 'auto';
    audioRef.current = audio;

    const advance = () => {
      indexRef.current += 1;
      // Re-shuffle when the playlist cycles so it never repeats in the same order
      if (indexRef.current >= playlistRef.current.length) {
        playlistRef.current = shuffled(TRACKS);
        indexRef.current = 0;
      }
      audio.src = playlistRef.current[indexRef.current]!;
      audio.load(); // required: tells the browser to fetch the new src
      if (!useSettingsStore.getState().musicMuted) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('ended', advance);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicMuted) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [musicMuted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  // Resume after first user gesture if autoplay was blocked
  useEffect(() => {
    const resume = () => {
      if (!audioRef.current || useSettingsStore.getState().musicMuted) return;
      audioRef.current.play().catch(() => {});
    };
    document.addEventListener('pointerdown', resume, { once: true });
    return () => document.removeEventListener('pointerdown', resume);
  }, []);

  return null;
}
