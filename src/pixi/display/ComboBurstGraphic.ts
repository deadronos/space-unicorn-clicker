import * as PIXI from 'pixi.js';

export class ComboBurstGraphic extends PIXI.Graphics {
  private life = 0;
  private maxLife = 400; // ms
  private particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: number; life: number }> = [];

  constructor() {
    super();
    this.alpha = 1;
    this.visible = false;
  }

  spawn(x: number, y: number, opts?: any) {
    this.life = 0;
    this.position.set(x, y);
    this.visible = true;
    this.alpha = 1;
    this.particles = [];

    const particleCount = opts?.count ?? 10;
    const colors = opts?.colors ?? [0x06b6d4, 0x60a5fa, 0xffffff];
    this.maxLife = opts?.maxLife ?? 400;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({ x: 0, y: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 2 + Math.random() * 4, color, life: 0 });
    }
  }

  tick(dt: number) {
    if (!this.visible) return;
    this.life += dt;
    if (this.life >= this.maxLife) {
      this.visible = false;
      return;
    }

    const t = this.life / this.maxLife;
    this.alpha = 1 - t;
    try { this.clear(); } catch (e) { }

    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.vy += 0.06; // light gravity

      const particleT = Math.min(p.life / this.maxLife, 1);
      const particleAlpha = (1 - particleT) * this.alpha;
      const particleSize = p.size * (1 - particleT * 0.5);

      if (particleAlpha > 0.01 && particleSize > 0.5) {
        try {
          this.circle(p.x, p.y, particleSize);
          this.fill({ color: p.color, alpha: particleAlpha });
        } catch (e) {
          // best-effort draw
        }
      }
    }

    // small flash at start
    if (t < 0.2) {
      const flashT = t / 0.2;
      const flashAlpha = (1 - flashT) * 0.8;
      const flashSize = 8 + flashT * 28;
      try {
        this.circle(0, 0, flashSize);
        this.fill({ color: 0xffffff, alpha: flashAlpha });
      } catch (e) { }
    }
  }

  isAlive() {
    return this.visible && this.life < this.maxLife;
  }
}

export class ComboBurstPool {
  private pool: ComboBurstGraphic[] = [];
  private container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  private getBurst() {
    let b = this.pool.find((p) => !p.visible);
    if (!b) {
      b = new ComboBurstGraphic();
      b.blendMode = 'add';
      this.pool.push(b);
      try { this.container.addChild(b); } catch (e) { }
    }
    return b;
  }

  spawn(x: number, y: number, opts?: any) {
    const b = this.getBurst();
    try { b.spawn(x, y, opts); } catch (e) { }
  }

  tick(dt: number) {
    for (const b of this.pool) {
      if (b.visible) {
        try { b.tick(dt); } catch (e) { }
      }
    }
  }
}
