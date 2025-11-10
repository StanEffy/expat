import React, { useRef, useState } from "react";
import styles from "./ImageMagnifier.module.scss";

type ImageMagnifierProps = {
  src: string;
  alt: string;
  zoomLevel?: number;
  magnifierSize?: number;
  className?: string;
  imageClassName?: string;
};

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt,
  zoomLevel = 2,
  magnifierSize = 160,
  className,
  imageClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>();

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    const pointerX = event.clientX - imageRect.left;
    const pointerY = event.clientY - imageRect.top;

    if (
      pointerX < 0 ||
      pointerY < 0 ||
      pointerX > imageRect.width ||
      pointerY > imageRect.height
    ) {
      setIsActive(false);
      return;
    }

    const clampedX = Math.min(Math.max(pointerX, 0), imageRect.width);
    const clampedY = Math.min(Math.max(pointerY, 0), imageRect.height);
    const halfSize = magnifierSize / 2;

    const rawLeft = event.clientX - containerRect.left - halfSize;
    const rawTop = event.clientY - containerRect.top - halfSize;

    const maxLeft = containerRect.width - magnifierSize;
    const maxTop = containerRect.height - magnifierSize;

    setIsActive(true);
    setLensStyle({
      width: `${magnifierSize}px`,
      height: `${magnifierSize}px`,
      left: `${Math.min(Math.max(rawLeft, 0), Math.max(maxLeft, 0))}px`,
      top: `${Math.min(Math.max(rawTop, 0), Math.max(maxTop, 0))}px`,
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${imageRect.width * zoomLevel}px ${imageRect.height * zoomLevel}px`,
      backgroundPosition: `${-(clampedX * zoomLevel - halfSize)}px ${-(clampedY * zoomLevel - halfSize)}px`,
    });
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const wrapperClassName = [styles.wrapper, className].filter(Boolean).join(" ");
  const imageClassNames = [styles.image, imageClassName].filter(Boolean).join(" ");

  return (
    <div
      ref={containerRef}
      className={wrapperClassName}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={imageClassNames}
        draggable={false}
      />
      {isActive && lensStyle ? (
        <div className={styles.lens} style={lensStyle} aria-hidden />
      ) : null}
    </div>
  );
};

export default ImageMagnifier;

