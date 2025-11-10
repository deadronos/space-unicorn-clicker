import { RefObject, useEffect, useRef } from 'react';

// Create a Pixi-compatible application. New PIXI prefers async
// initialization through Application.init(). We migrate `createPixiApp`
// to an async function that uses `init()` when available, but falls back
// to the older constructor for environments (or tests) that don't provide
// the newer API.
export async function createPixiApp(container: HTMLElement, options?: any): Promise<any> {
  // Detect test/jsdom environments — avoid importing/initializing real PIXI there
  const runningInNode = typeof process !== 'undefined' && !!(process.versions && process.versions.node);
  const runningInVitest = typeof process !== 'undefined' && !!(process.env && (process.env.VITEST || process.env.JEST_WORKER_ID));
  const runningInJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
  // Guard access to `process` so this code can run in browser environments
  // where `process` is not defined (Vite/runtime). Use typeof checks
  // everywhere before touching `process.env`.
  const isTestEnv = runningInVitest || runningInJsdom || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test');

  // Ensure PIXI is available on globalThis. If missing, attempt to import it
  // only when not running under test/jsdom — the real PIXI may try to initialize
  // a renderer which isn't available under jsdom and breaks tests.
  if (!isTestEnv && typeof (globalThis as any).PIXI === 'undefined' && typeof window !== 'undefined') {
    try {
      const m = await import('pixi.js');
      try { (globalThis as any).PIXI = m; } catch (e) {}
    } catch (e) {
      // dynamic import failed — we'll fall back to the canvas shim below
    }
  }

  const width = Math.max(1, (container && container.clientWidth) || 100);
  const height = Math.max(1, (container && container.clientHeight) || 100);
  const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;

  const PIXI = (globalThis as any).PIXI;
  if (PIXI && PIXI.Application) {
    try {
      const AppClass = PIXI.Application as any;
      const defaultOptions = Object.assign({ width, height, resolution: dpr, antialias: true, backgroundAlpha: 0 }, options || {});

      // If the Application prototype exposes `init`, use the new async init flow.
      // However, avoid using the async init path while running in test/jsdom
      // environments — prefer the synchronous constructor there.
      const prototypeHasInit = !!(AppClass && AppClass.prototype && typeof AppClass.prototype.init === 'function');
      const useInit = prototypeHasInit && !isTestEnv;

      let app: any;
      if (useInit) {
        // New flow: construct without options, then call init()
        app = new AppClass();
        try {
          await app.init(defaultOptions);
        } catch (e) {
          // If init fails, try fallback to constructor-with-options
          try { app = new AppClass(defaultOptions); } catch (er) { /* ignore */ }
        }
      } else {
        // Fallback: older constructor that accepts options
        app = new AppClass(defaultOptions);
      }

      try {
        const canvasEl = (app as any).canvas ?? (app as any).view;
        try { if (canvasEl) (canvasEl as any).__pixiApp = app; } catch (e) {}
        try { if (container && canvasEl) container.appendChild(canvasEl as unknown as Node); } catch (e) {}
      } catch (e) {}

      // Provide a safe resize helper that updates resolution and renderer size
      (app as any)._pixiResize = () => {
        try {
          const nowDpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
          const w = Math.max(1, container.clientWidth || 100);
          const h = Math.max(1, container.clientHeight || 100);
          if (app.renderer && typeof app.renderer.resize === 'function') {
            app.renderer.resolution = nowDpr;
            app.renderer.resize(w, h);
          } else if ((app as any).canvas ?? (app as any).view) {
            const view = ((app as any).canvas ?? (app as any).view) as HTMLCanvasElement;
            view.width = Math.max(1, Math.floor(w * nowDpr));
            view.height = Math.max(1, Math.floor(h * nowDpr));
            try { view.style.width = `${w}px`; view.style.height = `${h}px`; } catch (e) {}
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
    try { canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; } catch (e) {}
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
    canvas,
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
    const el = (app as any).canvas ?? (app as any).view;
    if (el) try { (el as any).__pixiApp = app; } catch (e) {}
  } catch (e) {}

  return app;
}

export function usePixiApp(containerRef: RefObject<HTMLElement>) {
  const appRef = useRef<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    let onResize: (() => void) | null = null;

    (async () => {
      const app = await createPixiApp(container);
      if (!mounted) {
        try { app.destroy?.(); } catch (e) {}
        return;
      }
      appRef.current = app;

      // wire up a simple resize handler when running under a real browser
      onResize = () => {
        try {
          if (app && typeof app._pixiResize === 'function') app._pixiResize();
          else if (app && app.renderer && typeof app.renderer.resize === 'function') {
            const w = Math.max(1, container.clientWidth || 100);
            const h = Math.max(1, container.clientHeight || 100);
            app.renderer.resize(w, h);
          } else if (app && (app.view || app.canvas)) {
            const view = (app.canvas ?? app.view) as HTMLCanvasElement;
            const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
            view.width = Math.max(1, Math.floor((container.clientWidth || 100) * dpr));
            view.height = Math.max(1, Math.floor((container.clientHeight || 100) * dpr));
          }
        } catch (e) {
          // ignore
        }
      };

      if (typeof window !== 'undefined' && onResize) {
        window.addEventListener('resize', onResize);
        onResize();
      }
    })();

    return () => {
      mounted = false;
      try {
        if (typeof window !== 'undefined' && onResize) window.removeEventListener('resize', onResize);
        appRef.current?.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [containerRef]);

  return appRef;
}
