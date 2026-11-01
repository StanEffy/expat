import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./ImageLightbox.module.scss";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

// Zoomed in, the photo is shown at this multiple of its own size
const ZOOM = 1.6;

/** Full-screen photo. Click (or tap) a spot to zoom in there, click again to fit the screen. */
const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // width of the zoomed-in photo in px; null while it fits the screen
  const [zoomWidth, setZoomWidth] = useState<number | null>(null);
  const zoomed = zoomWidth !== null;
  // the point to keep under the pointer after zooming in, as fractions of the picture
  const focus = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const point = focus.current;
    if (!zoomed || !viewport || !point) return;
    viewport.scrollLeft = point.x * viewport.scrollWidth - viewport.clientWidth / 2;
    viewport.scrollTop = point.y * viewport.scrollHeight - viewport.clientHeight / 2;
    focus.current = null;
  }, [zoomed]);

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (zoomed) {
      setZoomWidth(null);
      return;
    }
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    focus.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    setZoomWidth(Math.max(img.naturalWidth * ZOOM, rect.width * 2));
  };

  return createPortal(
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={t("shop.close", "Close")}>
        <i className="pi pi-times" aria-hidden="true" />
      </button>
      <div ref={viewportRef} className={`${styles.viewport} ${zoomed ? styles.viewportZoomed : ""}`}>
        <img
          src={src}
          alt={alt}
          className={zoomed ? styles.zoomed : styles.fit}
          style={zoomed ? { width: `${zoomWidth}px` } : undefined}
          onClick={toggleZoom}
          draggable={false}
        />
      </div>
      <p className={styles.hint}>{zoomed ? t("shop.zoomOutHint", "Click to fit the screen") : t("shop.zoomInHint", "Click a spot to zoom in")}</p>
    </div>,
    document.body,
  );
};

export default ImageLightbox;
