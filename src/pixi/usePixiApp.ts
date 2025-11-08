import { RefObject, useEffect, useRef } from 'react';

// Create a Pixi-compatible application. When a real `PIXI` global is present
// we instantiate `PIXI.Application`. Otherwise we create a minimal canvas-backed
// fallback that exposes `view`, `stage` and `destroy` so the rest of the code
// can operate in jsdom/tests.
export function createPixiApp(container: HTMLElement, options?: any): any {
  const hasPIXI = typeof (globalThis as any).PIXI !== 'undefined' && (globalThis as any).PIXI.Application;
  const width = Math.max(1, (container && container.clientWidth) || 100);
  const height = Math.max(1, (container && container.clientHeight) || 100);
  const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;

  if (hasPIXI) {
    try {
      const PIXI = (globalThis as any).PIXI;
      const app = new PIXI.Application(Object.assign({
        width,
        height,
        resolution: dpr,
        antialias: true,
        backgroundAlpha: 0,
      }, options || {}));

      try {
        (app.view as any).__pixiApp = app;
      } catch (e) {}

      try {
        if (container && app.view) container.appendChild(app.view as unknown as Node);
        try {
          // expose the app reference on the canvas element so tests/envs can access it
          try {
            (app.view as any).__pixiApp = app;
          } catch (e) {}
        } catch (e) {}
      } catch (e) {
        // ignore DOM append failures
      }

      // Provide a safe resize helper that updates resolution and renderer size
      (app as any)._pixiResize = () => {
        try {
          const nowDpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
          const w = Math.max(1, container.clientWidth || 100);
          const h = Math.max(1, container.clientHeight || 100);
          if (app.renderer && typeof app.renderer.resize === 'function') {
            app.renderer.resolution = nowDpr;
            app.renderer.resize(w, h);
          } else if ((app as any).view) {
            const view = (app as any).view as HTMLCanvasElement;
            view.width = Math.max(1, Math.floor(w * nowDpr));
            view.height = Math.max(1, Math.floor(h * nowDpr));
            view.style.width = `${w}px`;
            view.style.height = `${h}px`;
          }
        } catch (e) {
          // ignore
        }
      };

      return app;
    } catch (e) {
      // fallthrough to fallback
    }
  }

  // Fallback minimal canvas app for environments without PIXI (jsdom/tests)
  const canvas = (typeof document !== 'undefined' && document.createElement)
    ? document.createElement('canvas')
    : ({} as HTMLCanvasElement);

  try {
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  } catch (e) {
    // ignore
  }

  try {
    if (container && canvas) container.appendChild(canvas as unknown as Node);
  } catch (e) {
    // ignore append failures in unusual environments
  }

  const stage: any = {
    children: [],
    addChild(child: any) {
      this.children.push(child);
    },
    removeChild(child: any) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
    },
  };

  const app: any = {
    view: canvas,
    ticker: { autoStart: false, stop() {} },
    stage,
    renderer: {
      resolution: dpr,
      resize(w: number, h: number) {
        try {
          canvas.width = Math.max(1, Math.floor(w * dpr));
          canvas.height = Math.max(1, Math.floor(h * dpr));
        } catch (e) {
          // ignore
        }
      },
    },
    destroy(removeView = true) {
      try {
        if (removeView && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      } catch (e) {
        // ignore
      }
    },
  };

  try {
    (app.view as any).__pixiApp = app;
  } catch (e) {}

  return app;
}

export function usePixiApp(containerRef: RefObject<HTMLElement>) {
  const appRef = useRef<any | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = createPixiApp(container);
    appRef.current = app;

    // wire up a simple resize handler when running under a real browser
    const onResize = () => {
      try {
        if (app && typeof app._pixiResize === 'function') app._pixiResize();
        else if (app && app.renderer && typeof app.renderer.resize === 'function') {
          const w = Math.max(1, container.clientWidth || 100);
          const h = Math.max(1, container.clientHeight || 100);
          app.renderer.resize(w, h);
        } else if (app && app.view) {
          const view = app.view as HTMLCanvasElement;
          const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
          view.width = Math.max(1, Math.floor((container.clientWidth || 100) * dpr));
          view.height = Math.max(1, Math.floor((container.clientHeight || 100) * dpr));
        }
      } catch (e) {
        // ignore
      }
    };

    if (typeof window !== 'undefined') window.addEventListener('resize', onResize);

    return () => {
      try {
        if (typeof window !== 'undefined') window.removeEventListener('resize', onResize);
        app.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [containerRef]);

  return appRef;
}
