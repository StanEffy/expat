import { useLayoutEffect, type RefObject } from 'react';

// Elements marked with data-reveal, and the children of data-reveal-children,
// fade up when they scroll into view. Styles live in index.scss.
const SELECTOR = '[data-reveal], [data-reveal-children] > *';
const STAGGER_MS = 70;
const MAX_STAGGER_MS = 420;
const DURATION_MS = 750;

export const useScrollReveal = (rootRef: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const html = document.documentElement;
    html.classList.add('reveal-on');
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        // Items that enter together come in one after another, top to bottom
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        entering.forEach((entry, i) => {
          const el = entry.target as HTMLElement;
          const delay = Math.min(i * STAGGER_MS, MAX_STAGGER_MS);
          el.style.setProperty('--reveal-delay', `${delay}ms`);
          // data attributes, not classes: React rewrites className on re-render
          el.dataset.revealed = 'in';
          io.unobserve(el);
          window.setTimeout(() => {
            el.dataset.revealed = 'done';
          }, delay + DURATION_MS);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );

    const scan = (node: ParentNode) => {
      node.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan(root);
    const mo = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) scan(root);
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      html.classList.remove('reveal-on');
    };
  }, [rootRef]);
};

export default useScrollReveal;
