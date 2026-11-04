import type { CSSProperties } from "react";
import styles from "./KipinaLogo.module.scss";

/**
 * The Kipinä mark: four quarter-discs lean in from the corners, like people
 * huddled together. The yellow spark is never drawn on its own: it is the gap
 * the four leave between them, so it only exists while all of them are there
 * (an illusory figure in the spirit of Kanizsa and the Suprematists).
 */
const STAR = "M18 0 A18 18 0 0 0 36 18 A18 18 0 0 0 18 36 A18 18 0 0 0 0 18 A18 18 0 0 0 18 0 Z";

// The pieces are a touch smaller than the spark's arcs, so a hairline of air
// keeps the four readable as four, not as one tile with a hole.
const R = 16.2;
const PIECES = [
  { key: "tl", d: `M0 0 H${R} A${R} ${R} 0 0 1 0 ${R} Z`, dx: -1, dy: -1 },
  { key: "tr", d: `M36 0 V${R} A${R} ${R} 0 0 1 ${36 - R} 0 Z`, dx: 1, dy: -1 },
  { key: "br", d: `M36 36 H${36 - R} A${R} ${R} 0 0 1 36 ${36 - R} Z`, dx: 1, dy: 1 },
  { key: "bl", d: `M0 36 V${36 - R} A${R} ${R} 0 0 1 ${R} 36 Z`, dx: -1, dy: 1 },
] as const;

const MarkShapes = () => (
  <>
    <path className={styles.star} d={STAR} fill="var(--accent)" />
    <g fill="currentColor">
      {PIECES.map((p) => (
        <path
          key={p.key}
          className={styles.piece}
          d={p.d}
          style={{ "--dx": p.dx, "--dy": p.dy } as CSSProperties}
        />
      ))}
    </g>
  </>
);

/**
 * The mark on its own. `breathing` makes the four part a little and come back,
 * the spark fading and returning with them.
 */
export const KipinaMark = ({ className, breathing }: { className?: string; breathing?: boolean }) => (
  <svg
    className={`${styles.mark} ${breathing ? styles.breathing : ""} ${className ?? ""}`}
    viewBox="-6 -6 48 48"
    aria-hidden="true"
  >
    <MarkShapes />
  </svg>
);

/**
 * Mark and wordmark in one drawing. The letters are built from the same
 * primitives as the EXPAT mark (bars, chevrons, a ring, a cut triangle),
 * and the two dots of Ä are a pair in signal yellow.
 */
const KipinaLogo = ({ className }: { className?: string }) => (
  <span className={`${styles.logo} ${className ?? ""} notranslate`} translate="no" lang="fi">
    <svg className={styles.svg} viewBox="0 0 178 36" role="img" aria-label="KIPINÄ" fill="currentColor">
      <MarkShapes />
      <g transform="translate(44 0)" className={styles.word}>
        {/* K: stem and an inward chevron */}
        <rect x="0" y="3" width="5.5" height="30" />
        <polygon points="5.5,18 19,3 25.5,3 12,18 25.5,33 19,33" />
        {/* I */}
        <rect x="31" y="3" width="5.5" height="30" />
        {/* P: stem and ring, as in EXPAT */}
        <rect x="42.5" y="3" width="5.5" height="30" />
        <circle cx="54" cy="12" r="6.25" fill="none" stroke="currentColor" strokeWidth="5.5" />
        {/* I */}
        <rect x="69" y="3" width="5.5" height="30" />
        {/* N: two stems and a slanted bar */}
        <rect x="80.5" y="3" width="5.5" height="30" />
        <rect x="99" y="3" width="5.5" height="30" />
        <polygon points="80.5,3 86.5,3 104.5,33 98.5,33" />
        {/* Ä: a cut triangle under two yellow dots */}
        <path d="M122 10 L133 33 L111 33 Z M122 17.7 L118.5 26.2 L125.5 26.2 Z" fillRule="evenodd" />
        <circle className={styles.dot} cx="116.5" cy="4" r="2.9" fill="var(--accent)" />
        <circle className={`${styles.dot} ${styles.dot2}`} cx="127.5" cy="4" r="2.9" fill="var(--accent)" />
      </g>
    </svg>
  </span>
);

export default KipinaLogo;
