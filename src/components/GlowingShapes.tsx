import { useEffect, useState } from 'react';
import styles from './GlowingShapes.module.scss';

type ShapeType = 'square' | 'triangle' | 'cross' | 'circle';

interface Shape {
  type: ShapeType;
  x: number; // percentage
  y: number; // percentage
  size: number; // in pixels
  rotation: number; // in degrees
  opacity: number;
  key: string;
}

const GlowingShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    // Generate random seed for this page load
    const seed = Math.random() * 10000;
    let seedCounter = 0;
    
    const random = (min: number, max: number) => {
      seedCounter += 1;
      const value = ((Math.sin(seed + seedCounter) * 10000) % 1 + 1) % 1;
      return min + value * (max - min);
    };

    // Generate 4-8 shapes (not many, as requested)
    const shapeCount = Math.floor(random(4, 9));
    const shapeTypes: ShapeType[] = ['square', 'triangle', 'cross', 'circle'];
    
    const generatedShapes: Shape[] = [];
    
    for (let i = 0; i < shapeCount; i++) {
      const typeIndex = Math.floor(random(0, shapeTypes.length));
      const type = shapeTypes[typeIndex];
      
      generatedShapes.push({
        type,
        x: random(5, 95), // Random position (avoid edges)
        y: random(5, 95),
        size: random(150, 350), // Big shapes: 150-350px
        rotation: random(0, 360),
        opacity: random(0.08, 0.18), // Semi-transparent white
        key: `shape-${i}-${seed}-${seedCounter}`,
      });
    }
    
    setShapes(generatedShapes);
  }, []); // Empty dependency array - regenerate only on mount/refresh

  return (
    <div className={styles.container}>
      {shapes.map((shape) => (
        <div
          key={shape.key}
          className={`${styles.shapeWrapper} ${shape.type === 'triangle' ? styles.triangleWrapper : ''}`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
            opacity: shape.opacity,
          }}
        >
          <div
            className={`${styles.shape} ${styles[shape.type]}`}
          />
        </div>
      ))}
    </div>
  );
};

export default GlowingShapes;

