import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

// A Cirlce
class CompanionGraphic extends PIXI.Graphics {
  constructor(app: PIXI.Application, opts?: any) {
    super();
    app.stage.addChild(this);
    const glowColor = opts?.glowColor ?? 0xffff00;
    this.lineStyle(2, glowColor, 1);
    this.circle(0, 0, opts?.radius ?? 10);
    this.fill({ color: opts?.color ?? 0x000000 });
    this.filters = [new GlowFilter({
      distance: 15,
      outerStrength: 2,
      innerStrength: 0,
      color: glowColor,
      quality: 0.2,
    }) as unknown as any];
  }
}

export class Companion {
  private static _nextId = 1;
  public readonly id: number;
  public active: boolean = false;
  private _onFinish?: () => void;
  public display: CompanionGraphic | null = null;
  public orbitAngle: number;
  public orbitRadius: number;

  constructor() {
    this.id = Companion._nextId++;
    this.orbitAngle = Math.random() * 2 * Math.PI;
    this.orbitRadius = 100 + Math.random() * 50;
  }

  play(opts?: { onFinish?: () => void; app?: PIXI.Application; pixiOpts?: any }): void {
    this._onFinish = opts?.onFinish;
    this.active = true;

    try {
      const app = opts?.app;
      if (app) {
        this.display = new CompanionGraphic(app, opts?.pixiOpts);
      }
    } catch (e) {
      // ignore display failures
    }
  }

  update(delta: number, unicornCenter: PIXI.Point) {
    if (!this.display) return;
    this.orbitAngle += 0.01 * delta;
    this.display.x = unicornCenter.x + this.orbitRadius * Math.cos(this.orbitAngle);
    this.display.y = unicornCenter.y + this.orbitRadius * Math.sin(this.orbitAngle);
  }

  finish(): void {
    if (this.display && typeof this.display.destroy === 'function') {
      this.display.destroy();
    }
    this.display = null;
    this.active = false;
    const cb = this._onFinish;
    this._onFinish = undefined;
    if (cb) cb();
  }

  reset(): void {
    if (this.display && typeof this.display.destroy === 'function') {
      this.display.destroy();
    }
    this.display = null;
    this.active = false;
    this._onFinish = undefined;
  }
}