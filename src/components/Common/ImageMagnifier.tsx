import React, { useRef, useState } from "react";
import styles from "./ImageMagnifier.module.scss";

type ImageMagnifierProps = {
  src: string;
  alt: string;
  /** minimum magnification; it goes higher when needed to show the photo's own pixels */
  zoomLevel?: number;
  magnifierSize?: number;
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  /** accessible name of the click action, e.g. "Enlarge photo" */
  clickLabel?: string;
};

// Where the picture actually sits inside the <img> box, honouring object-fit and object-position
const contentRect = (img: HTMLImageElement) => {
  const box = img.getBoundingClientRect();
  const { naturalWidth: nw, naturalHeight: nh } = img;
  if (!nw || !nh) return box;
  const style = getComputedStyle(img);
  const fit = style.objectFit;
  let scale = 1;
  if (fit === "contain" || fit === "scale-down") scale = Math.min(box.width / nw, box.height / nh);
  else if (fit === "cover") scale = Math.max(box.width / nw, box.height / nh);
  else return box; // fill: the picture is stretched over the whole box
  if (fit === "scale-down") scale = Math.min(scale, 1);
  const width = nw * scale;
  const height = nh * scale;
  const [px, py] = style.objectPosition.split(" ").map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
  return {
    left: box.left + (box.width - width) * px,
    top: box.top + (box.height - height) * py,
    width,
    height,
  };
};

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt,
  zoomLevel = 2,
  magnifierSize = 200,
  className,
  imageClassName,
  onClick,
  clickLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>();

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const img = imageRef.current;
    if (!containerRef.current || !img) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const picture = contentRect(img);
    const pointerX = event.clientX - picture.left;
    const pointerY = event.clientY - picture.top;

    if (pointerX < 0 || pointerY < 0 || pointerX > picture.width || pointerY > picture.height) {
      setIsActive(false);
      return;
    }

    // At least the photo's own resolution, a bit more, so small print becomes readable
    const zoom = Math.max(zoomLevel, (img.naturalWidth / picture.width) * 1.2);
    const halfSize = magnifierSize / 2;
    const maxLeft = containerRect.width - magnifierSize;
    const maxTop = containerRect.height - magnifierSize;
    const left = event.clientX - containerRect.left - halfSize;
    const top = event.clientY - containerRect.top - halfSize;

    setIsActive(true);
    setLensStyle({
      width: `${magnifierSize}px`,
      height: `${magnifierSize}px`,
      left: `${Math.min(Math.max(left, 0), Math.max(maxLeft, 0))}px`,
      top: `${Math.min(Math.max(top, 0), Math.max(maxTop, 0))}px`,
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${picture.width * zoom}px ${picture.height * zoom}px`,
      backgroundPosition: `${-(pointerX * zoom - halfSize)}px ${-(pointerY * zoom - halfSize)}px`,
    });
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const wrapperClassName = [styles.wrapper, onClick ? styles.clickable : "", className].filter(Boolean).join(" ");
  const imageClassNames = [styles.image, imageClassName].filter(Boolean).join(" ");

  return (
    <div
      ref={containerRef}
      className={wrapperClassName}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...(onClick && {
        role: "button",
        tabIndex: 0,
        "aria-label": clickLabel,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      })}
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
