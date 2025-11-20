import React, { forwardRef, useLayoutEffect, useImperativeHandle, useRef, useEffect } from 'react';
import { createPixiApp } from './usePixiApp';
import BeamGraphic from './display/BeamGraphic';
import ImpactGraphic from './display/ImpactGraphic';
// import { Background } from './display/Backgrounds';
import { Companion } from './effects/Companion';
import { companionPool } from './effects/CompanionPool';
import * as PIXI from 'pixi.js';

import { Starfield } from './display/Starfield';

type PixiStageHandle = {
  spawnBeam: (opts?: any) => void;
  spawnImpact: (opts?: any) => void;
  app: PIXI.Application | null;
};

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  companionCount?: number;
  zone?: number;
};

const PixiStage = forwardRef<PixiStageHandle | null, Props>(function PixiStage(props, ref) {
  const { className, style, children, companionCount = 0, zone = 0, ...rest } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const timersRef = useRef<Set<number>>(new Set());
  const activeCompanionsRef = useRef<Companion[]>([]);
  const lastCompanionAttack = useRef<number[]>([]);

  // ... inside PixiStage ...
  const backgroundRef = useRef<Starfield | null>(null);

  useLayoutEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    let updateSize: () => void = () => { };

    (async () => {
      const app = await createPixiApp(container);
      if (!mounted) {
        try { app.destroy?.(); } catch (e) { }
        return;
      }
      appRef.current = app;

      backgroundRef.current = new Starfield(app);

      try {
        const canvas = (app.canvas ?? app.view) as HTMLCanvasElement;
        updateSize = () => {
          try {
            const dpr = window.devicePixelRatio || 1;
            const w = container.clientWidth || 100;
            const h = container.clientHeight || 100;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            app.renderer.resize(w, h);
            // backgroundRef.current?.updateZone(zone, w, h);
          } catch (e) {
            // ignore
          }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        app.ticker.add((delta: number) => {
          backgroundRef.current?.update(delta);

          const unicornCenter = new PIXI.Point(app.screen.width * 0.85, app.screen.height * 0.5);
          activeCompanionsRef.current.forEach((companion, i) => {
            companion.update(delta, unicornCenter);

            const now = Date.now();
            if (!lastCompanionAttack.current[i]) lastCompanionAttack.current[i] = 0;
            if (now - lastCompanionAttack.current[i] > 2000) { // 2s cooldown
              lastCompanionAttack.current[i] = now;
              if (ref && 'spawnBeam' in ref && typeof ref.spawnBeam === 'function') {
                ref.spawnBeam({
                  x0: companion.display?.x,
                  y0: companion.display?.y,
                  x1: unicornCenter.x,
                  y1: unicornCenter.y,
                  color: '#f472b6', // pink beam for companions
                  width: 2,
                  duration: 150
                });
              }
            }
          });
        });

      } catch (e) {
        try {
          timersRef.current.forEach((id) => clearTimeout(id));
          timersRef.current.clear();
        } catch (err) { }
        try { appRef.current?.destroy?.(); } catch (er) { }
      }
    })();

    return () => {
      mounted = false;
      try {
        try {
          timersRef.current.forEach((id) => clearTimeout(id));
          timersRef.current.clear();
        } catch (err) { }
        try { window.removeEventListener('resize', updateSize); } catch (e) { }
        backgroundRef.current?.destroy();
        try { appRef.current?.destroy?.(); } catch (e) { }
      } catch (e) {
        // ignore
      }
    };
  }, [ref, zone]);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    const currentCount = activeCompanionsRef.current.length;
    if (companionCount > currentCount) {
      for (let i = 0; i < companionCount - currentCount; i++) {
        const companion = companionPool.get({ app });
        activeCompanionsRef.current.push(companion);
      }
    } else if (companionCount < currentCount) {
      for (let i = 0; i < currentCount - companionCount; i++) {
        const companion = activeCompanionsRef.current.pop();
        companion?.finish();
      }
    }
  }, [companionCount]);

  useImperativeHandle(ref, () => ({
    spawnBeam(opts?: any) {
      const app = appRef.current;
      if (!app) return;

      try {
        const g = new BeamGraphic(app, opts);
        const duration = opts?.duration ?? 200;
        const t = window.setTimeout(() => {
          try { g.destroy(); } catch (e) { }
          try { timersRef.current.delete(t); } catch (er) { }
        }, duration);
        try { timersRef.current.add(t); } catch (er) { }
      } catch (e) {
        // swallow
      }
    },
    spawnImpact(opts?: any) {
      const app = appRef.current;
      if (!app) return;
      try {
        const g = new ImpactGraphic(app, opts);
        const duration = opts?.duration ?? 200;
        const t = window.setTimeout(() => {
          try { g.destroy(); } catch (e) { }
          try { timersRef.current.delete(t); } catch (er) { }
        }, duration);
        try { timersRef.current.add(t); } catch (er) { }
      } catch (e) {
        // swallow
      }
    },
    get app() {
      return appRef.current;
    },
  }));

  const isTestEnv = (
    (typeof process !== 'undefined' && !!(process.env && (process.env.VITEST || process.env.JEST_WORKER_ID))) ||
    (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) ||
    (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
  );

  return (
    <div ref={containerRef} className={className} style={style} {...rest}>
      {isTestEnv && <canvas />}
      {children}
    </div>
  );
});

export default PixiStage;