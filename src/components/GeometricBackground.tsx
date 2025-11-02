import { useEffect, useState, useRef } from 'react';
import styles from './GeometricBackground.module.scss';

// Import all SVG patterns
import circleInCircle from '../assets/svg/patterns/circle-in-circle.svg';
import circleIntersectionPlusX from '../assets/svg/patterns/circle-intersection-in-plus-and-X-shape-layout.svg';
import circleIntersectionX from '../assets/svg/patterns/circle-intersection-in-X-shape-layout.svg';
import cross8Petal from '../assets/svg/patterns/cross-8-petal.svg';
import cross8Pizza from '../assets/svg/patterns/cross-8-pizza-shape.svg';
import diamondLongDiagonal from '../assets/svg/patterns/diamond-long-diagonal.svg';
import diamondLongStacked from '../assets/svg/patterns/diamond-long-stacked.svg';
import diamondMediumAlternates from '../assets/svg/patterns/diamond-medium-alternates.svg';
import flowerCircleIntersection from '../assets/svg/patterns/flower-circle-intersection-in-plus-and-X-shape-layout.svg';
import rectangleQuarterHashtag from '../assets/svg/patterns/rectangle-quarter-hashtag-shape.svg';
import shapeHeart from '../assets/svg/patterns/shape-heart.svg';
import squareLargeDonut from '../assets/svg/patterns/square-large-donut.svg';
import squareLargeRoundOval from '../assets/svg/patterns/square-large-round-oval-cut.svg';
import squareTinyStep from '../assets/svg/patterns/square-tiny-step-mirror.svg';
import starRectangle16Bloat from '../assets/svg/patterns/star-rectangle-16-bloat-round.svg';
import starRectangle16Round from '../assets/svg/patterns/star-rectangle-16-round.svg';
import starRectangle4Bloat from '../assets/svg/patterns/star-rectangle-4-bloat-round-X-shape.svg';
import starRectangle8Bloat from '../assets/svg/patterns/star-rectangle-8-bloat-round.svg';
import triangleEquilateral2 from '../assets/svg/patterns/triangle-equilateral-2-mirror-offset.svg';
import triangleSmallAlternates from '../assets/svg/patterns/triangle-small-alternates.svg';
import triangleSmallAlternatesOffset from '../assets/svg/patterns/triangle-small-alternates-offset.svg';

// All SVG patterns
const svgPatterns = [
  circleInCircle,
  circleIntersectionPlusX,
  circleIntersectionX,
  cross8Petal,
  cross8Pizza,
  diamondLongDiagonal,
  diamondLongStacked,
  diamondMediumAlternates,
  flowerCircleIntersection,
  rectangleQuarterHashtag,
  shapeHeart,
  squareLargeDonut,
  squareLargeRoundOval,
  squareTinyStep,
  starRectangle16Bloat,
  starRectangle16Round,
  starRectangle4Bloat,
  starRectangle8Bloat,
  triangleEquilateral2,
  triangleSmallAlternates,
  triangleSmallAlternatesOffset,
];

interface PatternElement {
  svgContent: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  key: string;
}

const GeometricBackground = () => {
  const [patterns, setPatterns] = useState<PatternElement[]>([]);
  const [cursorPattern, setCursorPattern] = useState<PatternElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef({ x: 50, y: 50 });

  // Load SVG content and replace fill color
  const loadAndColorizeSVG = async (svgUrl: string, color: string): Promise<string> => {
    try {
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      // Replace fill attributes with our color
      const coloredSVG = svgText
        .replace(/fill=['"](#808|#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))['"]/g, `fill="${color}"`)
        .replace(/<svg/, `<svg style="width: 100%; height: 100%;"`);
      return coloredSVG;
    } catch (error) {
      console.error('Failed to load SVG:', error);
      return '';
    }
  };

  // Theme colors - extract RGB values from theme variables
  const themeColors = [
    { r: 151, g: 96, b: 200 },   // primary-3
    { r: 164, g: 123, b: 200 },  // primary-4
    { r: 207, g: 91, b: 175 },   // secondary-a-3
    { r: 196, g: 229, b: 101 },  // secondary-b-3
    { r: 234, g: 229, b: 103 },  // complement-3
    { r: 98, g: 44, b: 144 },    // primary-0
    { r: 160, g: 41, b: 127 },   // secondary-a-0
    { r: 214, g: 207, b: 54 },   // complement-0
  ];

  useEffect(() => {
    // Generate random seed for this page load
    const seed = Math.random() * 10000;
    let seedCounter = 0;
    const random = (min: number, max: number) => {
      seedCounter += 1;
      // Use modulo to ensure value is always less than max
      const value = ((Math.sin(seed + seedCounter) * 10000) % 1 + 1) % 1; // Ensures 0 <= value < 1
      return min + value * (max - min);
    };

    // Random number of patterns (between 15-35)
    const patternCount = 15 + Math.floor(random(0, 21));

    const generatePatterns = async () => {
      const generatedPatterns: PatternElement[] = [];

      for (let i = 0; i < patternCount; i++) {
        // Ensure indices are always valid (0 to length-1)
        const svgIndex = Math.max(0, Math.min(Math.floor(random(0, svgPatterns.length)), svgPatterns.length - 1));
        const colorIndex = Math.max(0, Math.min(Math.floor(random(0, themeColors.length)), themeColors.length - 1));
        const color = themeColors[colorIndex];
        
        // Safety check for color
        if (!color || !color.r || !color.g || !color.b) {
          console.warn('Invalid color at index:', colorIndex, 'themeColors length:', themeColors.length, 'color:', color);
          continue; // Skip this iteration if color is invalid
        }
        
        const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

        // Safety check for SVG
        if (!svgPatterns[svgIndex]) {
          console.warn('Invalid SVG index:', svgIndex, 'svgPatterns length:', svgPatterns.length);
          continue; // Skip this iteration if SVG is invalid
        }

        // Load and colorize SVG
        const coloredSVG = await loadAndColorizeSVG(svgPatterns[svgIndex], rgbColor);

        if (coloredSVG) {
          generatedPatterns.push({
            svgContent: coloredSVG,
            x: random(-5, 105), // Allow some to be slightly off-screen for variety
            y: random(-5, 105),
            size: random(40, 200), // Size in pixels
            rotation: random(0, 360), // Rotation in degrees
            opacity: random(0.08, 0.25), // Opacity
            color: rgbColor,
            key: `pattern-${i}-${seed}-${seedCounter}`,
          });
        }
      }

      setPatterns(generatedPatterns);
    };

    generatePatterns();

    // Create cursor-following pattern (using a small pattern)
    const createCursorPattern = async () => {
      const seed = Math.random() * 10000;
      // Use a small, simple pattern - circle-in-circle or triangle-small-alternates
      const smallPatterns = [circleInCircle, triangleSmallAlternates, triangleSmallAlternatesOffset, squareTinyStep];
      const svgIndex = Math.floor(Math.random() * smallPatterns.length);
      const colorIndex = Math.floor(Math.random() * themeColors.length);
      const color = themeColors[colorIndex];
      
      if (color && color.r && color.g && color.b) {
        const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        const coloredSVG = await loadAndColorizeSVG(smallPatterns[svgIndex], rgbColor);
        
        if (coloredSVG) {
          setCursorPattern({
            svgContent: coloredSVG,
            x: 50,
            y: 50,
            size: 40 + Math.random() * 20, // Small size: 40-60px
            rotation: Math.random() * 360,
            opacity: 0.15 + Math.random() * 0.1, // Slightly more visible: 0.15-0.25
            color: rgbColor,
            key: `cursor-pattern-${seed}`,
          });
        }
      }
    };

    createCursorPattern();
  }, []); // Empty dependency array - regenerate only on mount

  // Track mouse movement with throttling
  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (!containerRef.current) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          // Only update if position changed significantly (reduce unnecessary renders)
          // Threshold of 0.5% reduces updates by ~80% while maintaining smooth appearance
          if (
            Math.abs(x - lastPositionRef.current.x) > 0.5 ||
            Math.abs(y - lastPositionRef.current.y) > 0.5
          ) {
            setCursorPosition({ x, y });
            lastPositionRef.current = { x, y };
          }
          
          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []); // Empty deps - only set up once

  return (
    <div ref={containerRef} className={styles.container}>
      {patterns.map((pattern) => (
        <div
          key={pattern.key}
          className={styles.pattern}
          style={{
            left: `${pattern.x}%`,
            top: `${pattern.y}%`,
            width: `${pattern.size}px`,
            height: `${pattern.size}px`,
            transform: `translate(-50%, -50%) rotate(${pattern.rotation}deg)`,
            opacity: pattern.opacity,
          }}
          dangerouslySetInnerHTML={{ __html: pattern.svgContent }}
        />
      ))}
      {cursorPattern && (
        <div
          key={cursorPattern.key}
          className={styles.cursorPattern}
          style={{
            left: `${cursorPosition.x}%`,
            top: `${cursorPosition.y}%`,
            width: `${cursorPattern.size}px`,
            height: `${cursorPattern.size}px`,
            transform: `translate(-50%, -50%) rotate(${cursorPattern.rotation}deg)`,
            opacity: cursorPattern.opacity,
          }}
          dangerouslySetInnerHTML={{ __html: cursorPattern.svgContent }}
        />
      )}
    </div>
  );
};

export default GeometricBackground;

