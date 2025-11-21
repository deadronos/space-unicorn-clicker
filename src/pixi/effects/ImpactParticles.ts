import { ParticleGraphic, ParticleOptions } from '../display/ParticleGraphic';

export class Particle {
  id: number;
  active: boolean = false;
  graphic?: ParticleGraphic;
  private onFinish?: () => void;

  constructor(id: number) {
    this.id = id;
  }

  play(opts: { duration?: number; onFinish?: () => void; app: any; pixiOpts: ParticleOptions }): void {
    this.active = true;
    this.onFinish = opts.onFinish;

    if (this.graphic) {
      this.graphic.destroy();
    }

    try {
      this.graphic = new ParticleGraphic(opts.app, opts.pixiOpts);
    } catch (e) {
      // fail silently
    }

    // We rely on the graphic's internal update loop, but we need a timer to kill it
    // Or we could have the graphic handle its own death?
    // For now, keep the timer for simplicity and pooling management
    setTimeout(() => {
      this.finish();
      if (this.onFinish) this.onFinish();
    }, opts.duration || 300);
  }

  finish(): void {
    if (this.graphic) {
      this.graphic.destroy();
      this.graphic = undefined;
    }
    this.active = false;
  }

  reset(): void {
    this.finish();
    this.onFinish = undefined;
  }
}

export class ImpactParticles {
  private pool: Particle[] = [];
  private nextId = 1;

  alloc(): Particle {
    const free = this.pool.find(p => !p.active);
    if (free) return free;
    const p = new Particle(this.nextId++);
    this.pool.push(p);
    return p;
  }

  release(p: Particle): void {
    p.reset();
  }

  spawn(x: number, y: number, count: number = 1, duration: number = 300, opts?: { app?: any; pixiOpts?: any }): Particle[] {
    const out: Particle[] = [];
    if (!opts?.app) return out;

    for (let i = 0; i < count; i++) {
      const p = this.alloc();
      out.push(p);

      // Randomize velocity for "explosion" effect
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const baseColor = opts.pixiOpts?.color || 0xFFFFFF;

      const particleOpts: ParticleOptions = {
        x,
        y,
        color: baseColor,
        size: (opts.pixiOpts?.r || 2) * (Math.random() * 0.5 + 0.8),
        vx,
        vy,
        gravity: 0.1,
        friction: 0.95,
        fade: 0.02,
        shrink: 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };

      p.play({ duration: duration * (Math.random() * 0.5 + 0.8), onFinish: () => this.release(p), app: opts.app, pixiOpts: particleOpts });
    }
    return out;
  }

  getPoolLength(): number {
    return this.pool.length;
  }

  getActiveCount(): number {
    return this.pool.filter(p => p.active).length;
  }
}
