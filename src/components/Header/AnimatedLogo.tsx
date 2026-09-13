import { useState } from "react";
import styles from "./AnimatedLogo.module.scss";

const AnimatedLogo = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${styles.logoContainer} notranslate`}
      translate="no"
      lang="en"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        className={`${styles.logoSvg} ${isHovered ? styles.hovered : ""}`}
        viewBox="0 0 156 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="EXPAT"
      >
        <defs>
          {/* Golden gradient for the iconic X */}
          <linearGradient id="expat_gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Crisp luminous white gradient for E, P, A, T */}
          <linearGradient id="expat_white" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Subtle gradient for E triangles */}
          <linearGradient id="expat_e_top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="expat_e_bottom" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Letter E: Two intersecting isosceles triangles pointing left < < */}
        <g className={styles.letterE}>
          <polygon
            points="2,11 24,3 24,19"
            fill="url(#expat_e_top)"
            className={styles.eTop}
          />
          <polygon
            points="2,25 24,17 24,33"
            fill="url(#expat_e_bottom)"
            className={styles.eBottom}
          />
          {/* Subtle separator line for depth where triangles intersect */}
          <line
            x1="20"
            y1="18"
            x2="24"
            y2="18"
            stroke="rgba(20, 8, 36, 0.45)"
            strokeWidth="1.2"
          />
        </g>

        {/* Letter X: Two intersecting golden rectangles rotated at 45° and -45° */}
        <g className={styles.letterX} transform="translate(43, 18)">
          <rect
            x="-17"
            y="-2.75"
            width="34"
            height="5.5"
            rx="2.75"
            transform="rotate(45)"
            fill="url(#expat_gold)"
            className={styles.xBar1}
          />
          <rect
            x="-17"
            y="-2.75"
            width="34"
            height="5.5"
            rx="2.75"
            transform="rotate(-45)"
            fill="url(#expat_gold)"
            className={styles.xBar2}
          />
        </g>

        {/* Letter P: Vertical rectangle and circle */}
        <g className={styles.letterP}>
          <circle
            cx="75.5"
            cy="12"
            r="6.25"
            stroke="url(#expat_white)"
            strokeWidth="5.5"
            fill="none"
            className={styles.pCircle}
          />
          <rect
            x="64"
            y="3"
            width="5.5"
            height="30"
            rx="2"
            fill="url(#expat_white)"
            className={styles.pStem}
          />
        </g>

        {/* Letter A: Isosceles triangle with geometric cutout */}
        <g className={styles.letterA}>
          <path
            d="M 106 3 L 119 33 L 93 33 Z M 106 13 L 101.5 24 L 110.5 24 Z"
            fillRule="evenodd"
            fill="url(#expat_white)"
            className={styles.aTriangle}
          />
        </g>

        {/* Letter T: Two rectangles (horizontal bar + vertical stem) */}
        <g className={styles.letterT}>
          <rect
            x="137.25"
            y="8"
            width="5.5"
            height="25"
            rx="2"
            fill="url(#expat_white)"
            className={styles.tStem}
          />
          <rect
            x="127"
            y="3"
            width="26"
            height="5.5"
            rx="2"
            fill="url(#expat_white)"
            className={styles.tBar}
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
