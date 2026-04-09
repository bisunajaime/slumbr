import { useEffect, useRef } from 'react';
import './AmberFilter.scss';

const DIMMING_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MIN_BRIGHTNESS = 0.2;

interface Props {
  active: boolean; // true while a story is being read
}

// Wraps the entire page — dims screen progressively while reading
export function AmberFilter({ active }: Props) {
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) {
      startTimeRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (filterRef.current) filterRef.current.style.opacity = '0';
      return;
    }

    startTimeRef.current = performance.now();

    const tick = () => {
      if (!startTimeRef.current || !filterRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min(elapsed / DIMMING_DURATION_MS, 1);
      // Opacity of the dark overlay increases as progress grows
      const overlayOpacity = progress * (1 - MIN_BRIGHTNESS);
      filterRef.current.style.opacity = String(overlayOpacity);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return <div ref={filterRef} className="amber-filter" aria-hidden />;
}
