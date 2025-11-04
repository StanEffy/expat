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
  scrollSpeed: number; // 0 = fixed/static, 0.5 = slow scroll, 1 = normal scroll, 1.5 = fast scroll
  initialTop: number; // initial top position in viewport percentage
  key: string;
}

const GlowingShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [scrollY, setScrollY] = useState(0);

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
      
      // Randomly assign scroll behavior: 50% fixed, 50% scrolling at different speeds
      const scrollBehavior = random(0, 1);
      let scrollSpeed = 0; // Default to fixed
      
      if (scrollBehavior > 0.5) {
        // Scrolling shapes with varying speeds - slower parallax effect
        scrollSpeed = random(0.1, 0.4); // Slow parallax scroll
      }
      // else scrollSpeed remains 0 (fixed)
      
      generatedShapes.push({
        type,
        x: random(5, 95), // Random position (avoid edges)
        y: random(5, 95),
        size: random(150, 350), // Big shapes: 150-350px
        rotation: random(0, 360),
        opacity: random(0.08, 0.18), // Semi-transparent white
        scrollSpeed,
        initialTop: random(5, 95),
        key: `shape-${i}-${seed}-${seedCounter}`,
      });
    }
    
    setShapes(generatedShapes);
  }, []); // Empty dependency array - regenerate only on mount/refresh

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Set initial scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      {shapes.map((shape) => {
        // For fixed shapes: position stays constant
        // For scrolling shapes: calculate parallax offset based on scroll and speed
        const parallaxOffset = shape.scrollSpeed === 0 
          ? 0 
          : scrollY * shape.scrollSpeed;
        
        // Convert pixel offset to viewport percentage
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
        const topOffsetPercent = (parallaxOffset / viewportHeight) * 100;
        
        return (
          <div
            key={shape.key}
            className={`${styles.shapeWrapper} ${shape.type === 'triangle' ? styles.triangleWrapper : ''} ${shape.scrollSpeed === 0 ? styles.fixed : styles.scrolling}`}
            style={{
              left: `${shape.x}%`,
              top: `${shape.initialTop}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              transform: `translate(-50%, calc(-50% + ${topOffsetPercent}vh)) rotate(${shape.rotation}deg)`,
              opacity: shape.opacity,
            }}
          >
            <div
              className={`${styles.shape} ${styles[shape.type]}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GlowingShapes;

