import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPixiApp } from './usePixiApp';

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = createPixiApp(container);
    appRef.current = app;

    // handle basic DPR / sizing
    try {
      const canvas = (app as any).view as HTMLCanvasElement;
      const updateSize = () => {
        try {
          const dpr = (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) || 1;
          const w = container.clientWidth || 100;
          const h = container.clientHeight || 100;
          canvas.width = Math.max(1, Math.floor(w * dpr));
          canvas.height = Math.max(1, Math.floor(h * dpr));
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        } catch (e) {
          // ignore
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
        try {
          app.destroy?.();
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      try {
        app.destroy?.();
      } catch (er) {
        // ignore
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    spawnBeam(opts?: any) {
      const app = appRef.current;
      if (!app) return;
      const canvas = (app as any).view as HTMLCanvasElement;
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
      const canvas = (app as any).view as HTMLCanvasElement;
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
    app: appRef.current,
  }));

  return (
    <div ref={containerRef} className={className} style={style} {...rest}>
      {children}
    </div>
  );
});

export default PixiStage;
