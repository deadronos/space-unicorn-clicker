import React, { forwardRef, useLayoutEffect, useImperativeHandle, useRef } from 'react';
import { createPixiApp } from './usePixiApp';
import BeamGraphic from './display/BeamGraphic';
import ImpactGraphic from './display/ImpactGraphic';

type PixiStageHandle = {
  spawnBeam: (opts?: any) => void;
  spawnImpact: (opts?: any) => void;
  app: any;
};

type Props = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

const PixiStage = forwardRef<PixiStageHandle | null, Props>(function PixiStage(props, ref) {
  const { className, style, children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<any>(null);
  const timersRef = useRef<Set<number>>(new Set());

  useLayoutEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    let updateSize: () => void = () => {};

    (async () => {
      const app = await createPixiApp(container);
      if (!mounted) {
        try { app.destroy?.(); } catch (e) {}
        return;
      }
      appRef.current = app;

      // handle basic DPR / sizing
      try {
        const canvas = ((app as any).canvas ?? (app as any).view) as HTMLCanvasElement;
        updateSize = () => {
          try {
            const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
            const w = container.clientWidth || 100;
            const h = container.clientHeight || 100;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            try { canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; } catch (e) {}
          } catch (e) {
            // ignore
          }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
      } catch (e) {
        try {
          timersRef.current.forEach((id) => clearTimeout(id));
          timersRef.current.clear();
        } catch (err) {}
        try { appRef.current?.destroy?.(); } catch (er) {}
      }
    })();

    return () => {
      mounted = false;
      try {
        try {
          timersRef.current.forEach((id) => clearTimeout(id));
          timersRef.current.clear();
        } catch (err) {}
        try { window.removeEventListener('resize', updateSize); } catch (e) {}
        try { appRef.current?.destroy?.(); } catch (e) {}
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    spawnBeam(opts?: any) {
      const app = appRef.current;
      if (!app) return;

      // If PIXI is available, use BeamGraphic which manages its own lifecycle
      if (typeof (globalThis as any).PIXI !== 'undefined' && (globalThis as any).PIXI.Graphics) {
        try {
          const g = new BeamGraphic(app, opts);
          // Shorter default duration for spawned beams so they feel snappier
          const duration = opts?.duration ?? 200;
          const t = window.setTimeout(() => {
            try {
              g.destroy();
            } catch (e) {}
            try { timersRef.current.delete(t); } catch (er) {}
          }, duration);
          try { timersRef.current.add(t); } catch (er) {}
          return;
        } catch (e) {
          // fall back to canvas
        }
      }

      const canvas = ((app as any).canvas ?? (app as any).view) as HTMLCanvasElement;
      try {
        const ctx = canvas.getContext ? canvas.getContext('2d') : null;
        if (ctx) {
          ctx.save();
          ctx.strokeStyle = opts?.color || 'magenta';
          ctx.lineWidth = opts?.width || 2;
          ctx.beginPath();
          const w = canvas.width || 100;
          const h = canvas.height || 100;
          ctx.moveTo(opts?.x0 ?? w * 0.25, opts?.y0 ?? h * 0.5);
          ctx.lineTo(opts?.x1 ?? w * 0.75, opts?.y1 ?? h * 0.5);
          ctx.stroke();
          ctx.restore();
        }
      } catch (e) {
        // swallow
      }
    },
    spawnImpact(opts?: any) {
      const app = appRef.current;
      if (!app) return;

      if (typeof (globalThis as any).PIXI !== 'undefined' && (globalThis as any).PIXI.Graphics) {
        try {
          const g = new ImpactGraphic(app, opts);
          // Shorter default duration for impact fallback visuals
          const duration = opts?.duration ?? 200;
          const t = window.setTimeout(() => {
            try {
              g.destroy();
            } catch (e) {}
            try { timersRef.current.delete(t); } catch (er) {}
          }, duration);
          try { timersRef.current.add(t); } catch (er) {}
          return;
        } catch (e) {
          // fallback to canvas
        }
      }

      const canvas = ((app as any).canvas ?? (app as any).view) as HTMLCanvasElement;
      try {
        const ctx = canvas.getContext ? canvas.getContext('2d') : null;
        if (ctx) {
          ctx.save();
          ctx.fillStyle = opts?.color || 'yellow';
          const cx = opts?.x ?? (canvas.width || 100) / 2;
          const cy = opts?.y ?? (canvas.height || 100) / 2;
          const r = opts?.r ?? 6;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } catch (e) {
        // swallow
      }
    },
    get app() {
      return appRef.current
    },
  }));

  return (
    <div ref={containerRef} className={className} style={style} {...rest}>
      {children}
    </div>
  );
});

export default PixiStage;
