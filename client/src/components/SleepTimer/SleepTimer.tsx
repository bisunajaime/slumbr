import { useEffect, useRef, useState } from 'react';
import './SleepTimer.scss';
import { useSettingsStore } from '../../store/useSettingsStore';

// Fades music out over this many ms before the screen goes dark
const FADE_DURATION_MS = 8_000;

export function SleepTimer() {
  const sleepTimerMinutes = useSettingsStore((s) => s.sleepTimerMinutes);
  const musicVolume       = useSettingsStore((s) => s.musicVolume);
  const setMusicVolume    = useSettingsStore((s) => s.setMusicVolume);
  const setMusicMuted     = useSettingsStore((s) => s.setMusicMuted);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [expired, setExpired]         = useState(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef    = useRef(musicVolume);

  // Keep volumeRef current so the fade closure always reads the latest value
  useEffect(() => { volumeRef.current = musicVolume; }, [musicVolume]);

  // (Re)start timer whenever the setting changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setExpired(false);

    if (sleepTimerMinutes <= 0) {
      setSecondsLeft(null);
      return;
    }

    const total = sleepTimerMinutes * 60;
    setSecondsLeft(total);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          triggerExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepTimerMinutes]);

  function triggerExpiry() {
    setExpired(true);
    // Gradually fade music volume to 0
    const steps   = 40;
    const stepMs  = FADE_DURATION_MS / steps;
    let   current = volumeRef.current;
    const decrement = current / steps;
    const fadeInterval = setInterval(() => {
      current = Math.max(0, current - decrement);
      setMusicVolume(current);
      if (current <= 0) {
        clearInterval(fadeInterval);
        setMusicMuted(true);
      }
    }, stepMs);
  }

  if (secondsLeft === null && !expired) return null;

  if (expired) {
    return <div className="sleep-timer-overlay" aria-hidden />;
  }

  const mins = Math.floor((secondsLeft ?? 0) / 60);
  const secs = ((secondsLeft ?? 0) % 60).toString().padStart(2, '0');

  return (
    <div className="sleep-timer-badge" aria-label={`Sleep timer: ${mins}:${secs} remaining`}>
      <span className="sleep-timer-badge__icon">◑</span>
      <span className="sleep-timer-badge__time">{mins}:{secs}</span>
    </div>
  );
}
