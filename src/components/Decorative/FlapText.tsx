import { useEffect, useState } from 'react';

// Split-flap board text: letters flip through random glyphs and settle left to right.
const GLYPHS = 'ABDEHIKLMNOPRSTUVÄÖ0123456789';
const TICK_MS = 45;

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
    if (prefersReducedMotion()) {
      setShown(text);
      return;
    }
    let tick = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        tick += 1;
        // each letter flips a few times before it lands
        const settled = Math.max(0, Math.floor((tick - 4) / 3));
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
