// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import PixiStage from './PixiStage';

describe('PixiStage with PIXI', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    const MockGraphics = function (this: any) {
      this._cleared = false;
      this._destroyed = false;
    } as any;
    MockGraphics.prototype.clear = function () {
      this._cleared = true;
    };
    MockGraphics.prototype.destroy = function () {
      this._destroyed = true;
    };

    const MockApp = function (this: any, options?: any) {
      const canvas = document.createElement('canvas');
      this.view = canvas;
      this.stage = {
        children: [] as any[],
        addChild: (c: any) => {
          this.stage.children.push(c);
        },
        removeChild: (c: any) => {
          const idx = this.stage.children.indexOf(c);
          if (idx >= 0) this.stage.children.splice(idx, 1);
        },
      };
      this.renderer = {
        resize: (w: number, h: number) => {
          this.view.width = w;
          this.view.height = h;
          this.screen.width = w;
          this.screen.height = h;
        },
        resolution: options?.resolution || 1,
      };
      this.screen = { width: 800, height: 600 };
      this.destroy = (removeView = true) => {
        if (removeView && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    } as any;

    (globalThis as any).PIXI = {
      Application: MockApp,
      Graphics: MockGraphics,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as any).PIXI;
  });

  it('adds and removes graphics on spawnBeam', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const ref = React.createRef<any>();

    // Use real timers briefly to allow React effects to run and the app to mount
    vi.useRealTimers();
    await act(async () => {
      root.render(React.createElement(PixiStage, { ref }));
      await new Promise((r) => setTimeout(r, 10));
    });
    // switch back to fake timers for deterministic timer control below
    vi.useFakeTimers();

    const app = ref.current?.app ?? (container.querySelector('canvas') as any)?.__pixiApp;
    expect(app).toBeDefined();
    const initialChildren = app.stage.children.length;
    // expect(initialChildren).toBe(0); // Starfield and ExplosionPool add children now

    ref.current.spawnBeam({ duration: 200 });

    expect(app.stage.children.length).toBeGreaterThan(initialChildren);

    vi.advanceTimersByTime(200);

    expect(app.stage.children.length).toBe(initialChildren);

    await act(async () => {
      root.unmount();
    });
    vi.advanceTimersByTime(0);
  });
});
