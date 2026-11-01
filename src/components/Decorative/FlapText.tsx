import { useEffect, useState } from 'react';

// Split-flap board text: letters flip through random glyphs and settle left to right.
const GLYPHS = 'ABDEHIKLMNOPRSTUVÄÖ0123456789';
const TICK_MS = 45;
const LEAD_MS = 180; // all letters spin before the first one lands
const SETTLE_MS = 135; // then one letter lands every SETTLE_MS

const scramble = (text: string, settled: number) =>
  text
    .split('')
    .map((ch, i) => (i < settled || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('');

const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface FlapTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const FlapText = ({ text, delay = 0, className }: FlapTextProps) => {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text : scramble(text, 0)));

  useEffect(() => {
    // A tab opened in the background throttles timers: show the final text there
    if (prefersReducedMotion() || document.hidden) {
      setShown(text);
      return;
    }
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      const began = performance.now();
      interval = window.setInterval(() => {
        // by elapsed time, not ticks, so a slow or throttled timer still lands on time
        const settled = Math.max(0, Math.floor((performance.now() - began - LEAD_MS) / SETTLE_MS));
        setShown(scramble(text, settled));
        if (settled >= text.length) window.clearInterval(interval);
      }, TICK_MS);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span className={className} translate="no">
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
};

export default FlapText;
