import { useEffect, useRef, useState } from 'react';
import styles from './GlowingShapes.module.scss';

type ShapeType = 'square' | 'triangle' | 'cross' | 'circle';

interface ShapeConfig {
  type: ShapeType;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // in pixels
  opacity: number;
  initialRotation: number;
  scrollFactorY: number; // parallax scroll multiplier
  scrollFactorX: number; // subtle horizontal drift with scroll
  driftX: number; // px
  driftY: number; // px
  driftDuration: number; // seconds
  driftDelay: number; // seconds (negative for instant motion variety)
  spinDuration: number; // seconds for full 360 rotation
  spinDelay: number; // seconds
  spinClockwise: boolean;
  scaleMin: number;
  scaleMax: number;
  pulseDuration: number; // seconds
  pulseDelay: number; // seconds
  key: string;
}

const REGION_BOUNDS = [
  { minX: 6, maxX: 26, minY: 6, maxY: 24 },   // Top-left
  { minX: 70, maxX: 92, minY: 8, maxY: 26 },  // Top-right
  { minX: 36, maxX: 60, minY: 24, maxY: 46 }, // Center
  { minX: 6, maxX: 28, minY: 52, maxY: 74 },  // Mid-left
  { minX: 68, maxX: 92, minY: 50, maxY: 72 }, // Mid-right
  { minX: 28, maxX: 62, minY: 72, maxY: 90 }, // Bottom-center
  { minX: 74, maxX: 94, minY: 78, maxY: 94 }, // Bottom-right
];

const generateShapes = (): ShapeConfig[] => {
  const seed = Math.random() * 10000;
  let counter = 0;
  const rand = (min: number, max: number) => {
    counter += 1;
    const v = ((Math.sin(seed + counter) * 10000) % 1 + 1) % 1;
    return min + v * (max - min);
  };

  const baseTypes: ShapeType[] = ['cross', 'triangle', 'square', 'circle'];
  // Shuffle to guarantee at least one of each shape type
  const shuffledTypes = [...baseTypes, ...baseTypes].sort(() => rand(-1, 1));

  const count = 7;
  const generated: ShapeConfig[] = [];

  for (let i = 0; i < count; i++) {
    const region = REGION_BOUNDS[i % REGION_BOUNDS.length];
    const type = shuffledTypes[i % shuffledTypes.length];
    const spinClockwise = rand(0, 1) > 0.5;

    generated.push({
      type,
      x: Math.round(rand(region.minX, region.maxX)),
      y: Math.round(rand(region.minY, region.maxY)),
      size: Math.round(rand(180, 330)),
      opacity: Math.round(rand(10, 20)) / 100, // 0.10 - 0.20
      initialRotation: Math.round(rand(0, 360)),
      scrollFactorY: Math.round(rand(-18, 32)) / 100, // -0.18 to +0.32 parallax
      scrollFactorX: Math.round(rand(-8, 8)) / 100, // subtle horizontal parallax
      driftX: Math.round(rand(-50, 50)),
      driftY: Math.round(rand(-45, 45)),
      driftDuration: Math.round(rand(12, 20) * 10) / 10,
      driftDelay: -Math.round(rand(0, 15) * 10) / 10,
      spinDuration: Math.round(rand(20, 42) * 10) / 10, // continuous noticeable 360° turn
      spinDelay: -Math.round(rand(0, 30) * 10) / 10,
      spinClockwise,
      scaleMin: Math.round(rand(86, 92)) / 100,
      scaleMax: Math.round(rand(108, 116)) / 100,
      pulseDuration: Math.round(rand(7, 12) * 10) / 10,
      pulseDelay: -Math.round(rand(0, 10) * 10) / 10,
      key: `shape-${i}-${type}`,
    });
  }

  return generated;
};

const GlowingShapes = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Synchronous initialization on first mount -> 0 flashes, 0 extra re-renders
  const [shapes] = useState<ShapeConfig[]>(generateShapes);

  // Update CSS custom property --scroll-y directly on the DOM container
  // ZERO React re-renders, 60-120fps hardware-accelerated parallax
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const updateScroll = () => {
      container.style.setProperty('--scroll-y', `${window.scrollY}px`);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container} aria-hidden="true">
      {shapes.map((shape) => (
        <div
          key={shape.key}
          className={`${styles.parallaxLayer} ${shape.type === 'triangle' ? styles.triangleLayer : ''}`}
          style={
            {
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              opacity: shape.opacity,
              '--scroll-fy': shape.scrollFactorY,
              '--scroll-fx': shape.scrollFactorX,
            } as React.CSSProperties
          }
        >
          <div
            className={styles.driftLayer}
            style={
              {
                '--drift-x': `${shape.driftX}px`,
                '--drift-y': `${shape.driftY}px`,
                animationDuration: `${shape.driftDuration}s`,
                animationDelay: `${shape.driftDelay}s`,
              } as React.CSSProperties
            }
          >
            <div
              className={shape.spinClockwise ? styles.spinCW : styles.spinCCW}
              style={
                {
                  '--init-rot': `${shape.initialRotation}deg`,
                  animationDuration: `${shape.spinDuration}s`,
                  animationDelay: `${shape.spinDelay}s`,
                } as React.CSSProperties
              }
            >
              <div
                className={styles.pulseLayer}
                style={
                  {
                    '--scale-min': shape.scaleMin,
                    '--scale-max': shape.scaleMax,
                    animationDuration: `${shape.pulseDuration}s`,
                    animationDelay: `${shape.pulseDelay}s`,
                  } as React.CSSProperties
                }
              >
                <div className={`${styles.shape} ${styles[shape.type]}`} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlowingShapes;

