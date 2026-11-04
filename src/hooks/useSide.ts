import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { rememberSide, rememberedSide, sideForPath, type Side } from '@/components/Sides/sides';

/**
 * The side the visitor is on. Side pages decide it; shared pages (profile,
 * about, login) keep the side the visitor came from. The chooser at "/" has none.
 */
export const useSide = (): Side | null => {
  const { pathname } = useLocation();
  const fromPath = sideForPath(pathname);

  useEffect(() => {
    if (fromPath) rememberSide(fromPath);
  }, [fromPath]);

  if (pathname === '/') return null;
  return fromPath ?? rememberedSide();
};
