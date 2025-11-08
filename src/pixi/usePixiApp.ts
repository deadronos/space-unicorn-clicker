import { RefObject, useEffect, useRef } from 'react';

// Synchronous helper that creates a minimal, safe Pixi-like "Application" for test
// and jsdom environments. It avoids creating WebGL contexts and will attach
// a simple canvas to the provided container.
export function createPixiApp(container: HTMLElement, options?: Partial<import('pixi.js').IApplicationOptions>): import('pixi.js').Application {
  const canvas = (typeof document !== 'undefined' && document.createElement)
    ? document.createElement('canvas')
    : ({} as HTMLCanvasElement);

  try {
    canvas.width = Math.max(1, container.clientWidth || 100);
    canvas.height = Math.max(1, container.clientHeight || 100);
  } catch (e) {
    // ignore
  }

  try {
    container.appendChild(canvas as unknown as Node);
  } catch (e) {
    // ignore append failures in unusual environments
  }

  const app: any = {
    view: canvas,
    ticker: {
      autoStart: false,
      stop() {},
    },
    stage: {},
    destroy(removeView = true) {
      try {
        if (removeView && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      } catch (e) {
        // ignore
      }
    },
  };

  return app as import('pixi.js').Application;
}

export function usePixiApp(containerRef: RefObject<HTMLElement>) {
  const appRef = useRef<import('pixi.js').Application | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = createPixiApp(container);
    appRef.current = app;

    return () => {
      try {
        app.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [containerRef]);

  return appRef;
}
