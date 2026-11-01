import styles from "./AnimatedLogo.module.scss";

// Flat signage version of the EXPAT mark: letters take currentColor, the X is signal yellow
const AnimatedLogo = () => {
  return (
    <div className={`${styles.logoContainer} notranslate`} translate="no" lang="en">
      <svg
        className={styles.logoSvg}
        viewBox="0 0 156 36"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="EXPAT"
      >
        {/* Letter E: two left-pointing chevrons < < */}
        <g className={styles.letterE}>
          <polygon points="2,11 24,3 24,19" />
          <polygon points="2,25 24,17 24,33" />
        </g>

        {/* Letter X: two crossed bars */}
        <g transform="translate(43, 18)">
          <g className={styles.letterX}>
            <rect x="-17" y="-2.75" width="34" height="5.5" transform="rotate(45)" />
            <rect x="-17" y="-2.75" width="34" height="5.5" transform="rotate(-45)" />
          </g>
        </g>

        {/* Letter P: stem and ring */}
        <g className={styles.letterP}>
          <circle cx="75.5" cy="12" r="6.25" stroke="currentColor" strokeWidth="5.5" fill="none" />
          <rect x="64" y="3" width="5.5" height="30" />
        </g>

        {/* Letter A: triangle with a triangular cutout */}
        <g className={styles.letterA}>
          <path d="M 106 3 L 119 33 L 93 33 Z M 106 13 L 101.5 24 L 110.5 24 Z" fillRule="evenodd" />
        </g>

        {/* Letter T: bar and stem */}
        <g className={styles.letterT}>
          <rect x="137.25" y="8" width="5.5" height="25" />
          <rect x="127" y="3" width="26" height="5.5" />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
