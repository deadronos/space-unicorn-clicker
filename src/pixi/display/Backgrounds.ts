
import * as PIXI from 'pixi.js';

const ZONES = [
  { from: '#1e3a8a', to: '#0c1e4a' }, // Deep Blue Space
  { from: '#4c1d95', to: '#2a0f5e' }, // Purple Nebula
  { from: '#b91c1c', to: '#7f1d1d' }, // Red Giant
  { from: '#065f46', to: '#043f2e' }, // Emerald Galaxy
  { from: '#fde047', to: '#facc15' }, // Golden Star
];

export class Background extends PIXI.Graphics {
  constructor(app: PIXI.Application) {
    super();
    try {
      if (app && app.stage && typeof (app.stage as any).addChildAt === 'function') {
        (app.stage as any).addChildAt(this, 0);
      }
    } catch (e) {
      // ignore stage insertion errors in non-browser/test environments
    }
  }

  updateZone(zone: number, width: number, height: number) {
    const zoneColors = ZONES[zone % ZONES.length];

    this.clear();

    const gradient = this.createGradient(zoneColors.from, zoneColors.to, width, height);

    try {
      // PixiJS v8
      if (typeof (this as any).rect === 'function' && typeof (this as any).fill === 'function') {
        (this as any).rect(0, 0, width, height);
        (this as any).fill({ texture: gradient });
      }
      // PixiJS v7 and below
      else if (typeof (this as any).beginTextureFill === 'function') {
        (this as any).beginTextureFill({ texture: gradient });
        (this as any).drawRect(0, 0, width, height);
        (this as any).endFill();
      }
    } catch (e) {
      // ignore
    }
  }

  createGradient(from: string, to: string, width: number, height: number): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx: CanvasRenderingContext2D | null = null;
    if (typeof (canvas as any).getContext === 'function') {
      try { ctx = (canvas as any).getContext('2d'); } catch (e) { ctx = null; }
    }

    if (!ctx) {
      try {
        // JSDOM or test env without canvas; try to return a safe PIXI fallback
        if ((PIXI as any) && (PIXI as any).Texture) {
          const T = (PIXI as any).Texture;
          if (T.WHITE) return T.WHITE;
          if (T.EMPTY) return T.EMPTY;
          if (typeof T.from === 'function') return T.from(canvas);
        }
      } catch (e) {
        // ignore
      }
      // As a last resort return a minimal stub
      return ({} as unknown) as PIXI.Texture;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return PIXI.Texture.from(canvas);
  }
}
