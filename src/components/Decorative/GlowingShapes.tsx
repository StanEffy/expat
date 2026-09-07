import { useEffect, useState } from 'react';
import styles from './GlowingShapes.module.scss';

type ShapeType = 'square' | 'triangle' | 'cross' | 'circle';

interface Shape {
  type: ShapeType;
  x: number; // percentage
  y: number; // percentage
  size: number; // in pixels
  opacity: number;
  initialRotation: number;
  rotationDelta: number;
  scaleMin: number;
  scaleMax: number;
  duration: number; // in seconds
  delay: number; // in seconds
  moveX: number; // in pixels
  moveY: number; // in pixels
  key: string;
}

const GlowingShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    const seed = Math.random() * 10000;
    let seedCounter = 0;

    const random = (min: number, max: number) => {
      seedCounter += 1;
      const value = ((Math.sin(seed + seedCounter) * 10000) % 1 + 1) % 1;
      return min + value * (max - min);
    };

    const shapeCount = Math.floor(random(4, 8));
    const shapeTypes: ShapeType[] = ['square', 'triangle', 'cross', 'circle'];
    const generatedShapes: Shape[] = [];

    for (let i = 0; i < shapeCount; i++) {
      const typeIndex = Math.floor(random(0, shapeTypes.length));
      const type = shapeTypes[typeIndex];

      const rotationDirection = random(0, 1) > 0.5 ? 1 : -1;
      const rotationSpeed = random(15, 35); // Degrees to rotate during cycle

      generatedShapes.push({
        type,
        x: random(5, 95),
        y: random(5, 95),
        size: random(160, 320),
        opacity: random(0.08, 0.16),
        initialRotation: random(0, 360),
        rotationDelta: rotationSpeed * rotationDirection,
        scaleMin: random(0.88, 0.94),
        scaleMax: random(1.06, 1.14),
        duration: random(12, 22),
        delay: random(0, 5),
        moveX: random(-25, 25),
        moveY: random(-25, 25),
        key: `shape-${i}-${seed}-${seedCounter}`,
      });
    }

    setShapes(generatedShapes);
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      {shapes.map((shape) => (
        <div
          key={shape.key}
          className={`${styles.shapeWrapper} ${shape.type === 'triangle' ? styles.triangleWrapper : ''}`}
          style={
            {
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              opacity: shape.opacity,
              '--init-rot': `${shape.initialRotation}deg`,
              '--rot-delta': `${shape.rotationDelta}deg`,
              '--scale-min': shape.scaleMin,
              '--scale-max': shape.scaleMax,
              '--duration': `${shape.duration}s`,
              '--delay': `-${shape.delay}s`,
              '--move-x': `${shape.moveX}px`,
              '--move-y': `${shape.moveY}px`,
            } as React.CSSProperties
          }
        >
          <div className={`${styles.shape} ${styles[shape.type]}`} />
        </div>
      ))}
    </div>
  );
};

export default GlowingShapes;

