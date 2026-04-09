import { useState, useEffect, useCallback } from 'react';

// Returns true while the user has been active within the last `timeoutMs`
export function useAutoHide(timeoutMs: number): boolean {
  const [visible, setVisible] = useState(true);

  const show = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      show();
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), timeoutMs);
    };

    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [timeoutMs, show]);

  return visible;
}
