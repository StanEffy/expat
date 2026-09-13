/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Wraps React.lazy with automatic reload on dynamic chunk load failure.
 * This happens when a new version of the application is deployed to production,
 * and an open client session tries to fetch old, deleted JS chunks.
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): LazyExoticComponent<T> =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('chunk_reload_attempted') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('chunk_reload_attempted', 'false');
      return component;
    } catch (error: unknown) {
      const err = error as Error | undefined;
      const message = err?.message || String(error);
      const isChunkError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('Expected a JavaScript module script') ||
        err?.name === 'ChunkLoadError';

      if (isChunkError && !pageHasBeenForceRefreshed) {
        window.sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
        return new Promise(() => {}); // Wait for reload
      }

      throw error;
    }
  });

export default lazyWithRetry;
