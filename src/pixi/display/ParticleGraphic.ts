import * as PIXI from 'pixi.js';

export interface ParticleOptions {
    x: number;
    y: number;
    color: string | number;
    size?: number;
    vx?: number;
    vy?: number;
    gravity?: number;
    friction?: number;
    fade?: number;
    shrink?: number;
    rotationSpeed?: number;
    existingGraphic?: PIXI.Graphics;
}

export class ParticleGraphic {
    public graphic: PIXI.Graphics;
    private vx: number;
    private vy: number;
    private gravity: number;
    private friction: number;
    private fade: number;
    private shrink: number;
    private rotationSpeed: number;
    private app: PIXI.Application;

    constructor(app: PIXI.Application, opts: ParticleOptions) {
        this.app = app;
        this.graphic = opts.existingGraphic || new PIXI.Graphics();

        if (!opts.existingGraphic) {
            this.graphic.circle(0, 0, opts.size || 2);
            this.graphic.fill(opts.color);
            this.app.stage.addChild(this.graphic);
        }

        this.graphic.x = opts.x;
        this.graphic.y = opts.y;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.gravity = opts.gravity || 0;
        this.friction = opts.friction || 1;
        this.fade = opts.fade || 0;
        this.shrink = opts.shrink || 0;
        this.rotationSpeed = opts.rotationSpeed || 0;

        // Add update listener
        this.app.ticker.add(this.update, this);
    }

    private update = (ticker: any) => {
        const delta = ticker?.deltaTime ?? ticker ?? 1;
        this.graphic.x += this.vx * delta;
        this.graphic.y += this.vy * delta;
        this.vy += this.gravity * delta;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.graphic.rotation += this.rotationSpeed * delta;
        this.graphic.alpha -= this.fade * delta;

        if (this.shrink > 0) {
            this.graphic.scale.x -= this.shrink * delta;
            this.graphic.scale.y -= this.shrink * delta;
            if (this.graphic.scale.x < 0) this.graphic.scale.set(0);
        }
    }

    public destroy() {
        this.app.ticker.remove(this.update, this);
        if (this.graphic.parent) {
            this.graphic.parent.removeChild(this.graphic);
        }
        if (!this.graphic.destroyed) {
            this.graphic.destroy();
        }
    }
}
