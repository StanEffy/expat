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
  // Animation properties
  rotationDirection: number; // 1 for clockwise, -1 for counter-clockwise
  rotationSpeed: number; // degrees per second (slow: 5-15)
  scaleMin: number; // minimum scale (0.8-0.95)
  scaleMax: number; // maximum scale (1.05-1.2)
  scaleDuration: number; // animation duration in seconds (8-20)
  moveDirectionX: number; // horizontal movement direction (-1 to 1)
  moveDirectionY: number; // vertical movement direction (-1 to 1)
  moveSpeed: number; // movement speed multiplier for scroll movement (0.25-0.75)
  moveDistance: number; // movement distance in percentage (5-15)
}

const GlowingShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [time, setTime] = useState(0);

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
      
      // Random rotation direction and speed
      const rotationDirection = random(0, 1) > 0.5 ? 1 : -1;
      const rotationSpeed = random(5, 15); // Slow rotation: 5-15 degrees per second
      
      // Scale animation properties
      const scaleMin = random(0.85, 0.95);
      const scaleMax = random(1.05, 1.15);
      const scaleDuration = random(8, 20); // 8-20 seconds per cycle
      
      // Movement direction (can be horizontal, vertical, or diagonal)
      const moveDirectionX = random(-1, 1);
      const moveDirectionY = random(-1, 1);
      const moveSpeed = random(0.25, 0.75); // Slow movement reacting to scroll distance
      const moveDistance = random(5, 12); // percentage
      
      generatedShapes.push({
        type,
        x: random(5, 95), // Random position (avoid edges)
        y: random(5, 95),
        size: random(150, 350), // Big shapes: 150-350px
        rotation: random(0, 360),
        opacity: random(0.08, 0.18), // Semi-transparent white
        scrollSpeed,
        initialTop: random(5, 95),
        rotationDirection,
        rotationSpeed,
        scaleMin,
        scaleMax,
        scaleDuration,
        moveDirectionX,
        moveDirectionY,
        moveSpeed,
        moveDistance,
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

  // Animation loop for rotation, scale, and movement
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      setTime((prevTime) => prevTime + deltaTime);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
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
        
        // Calculate rotation based on time and direction
        const currentRotation = shape.rotation + (time * shape.rotationSpeed * shape.rotationDirection);
        
        // Calculate scale using sine wave for smooth pulsing
        const scaleProgress = (time % shape.scaleDuration) / shape.scaleDuration;
        const scaleFactor = shape.scaleMin + (shape.scaleMax - shape.scaleMin) * 
          (Math.sin(scaleProgress * Math.PI * 2) * 0.5 + 0.5);
        
        // Calculate movement offset based on scroll position (moves only when scrolling)
        const safeViewportHeight = viewportHeight || 1;
        const scrollRatio = scrollY / safeViewportHeight;
        const moveOffsetX = scrollRatio * shape.moveDistance * shape.moveDirectionX * shape.moveSpeed;
        const moveOffsetY = scrollRatio * shape.moveDistance * shape.moveDirectionY * shape.moveSpeed;
        
        return (
          <div
            key={shape.key}
            className={`${styles.shapeWrapper} ${shape.type === 'triangle' ? styles.triangleWrapper : ''} ${shape.scrollSpeed === 0 ? styles.fixed : styles.scrolling}`}
            style={{
              left: `${shape.x}%`,
              top: `${shape.initialTop}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              transform: `translate(calc(-50% + ${moveOffsetX}%), calc(-50% + ${topOffsetPercent}vh + ${moveOffsetY}%)) rotate(${currentRotation}deg) scale(${scaleFactor})`,
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

