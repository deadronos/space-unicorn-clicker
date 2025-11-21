import * as PIXI from 'pixi.js';

export class ExplosionGraphic extends PIXI.Graphics {
    private life: number = 0;
    private maxLife: number = 600; // milliseconds
    private particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: number;
        life: number;
    }> = [];

    constructor() {
        super();
        this.alpha = 1;
    }

    spawn(x: number, y: number) {
        this.life = 0;
        this.position.set(x, y);
        this.alpha = 1;
        this.visible = true;

        // Create explosion particles
        this.particles = [];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 4;
            const colors = [0xff6600, 0xff9900, 0xffcc00, 0xff3300, 0xffffff];

            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 0
            });
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

        this.clear();

        // Update and draw particles
        for (const p of this.particles) {
            p.life += dt;
            p.x += p.vx * (dt / 16);
            p.y += p.vy * (dt / 16);
            p.vy += 0.15; // Gravity

            const particleT = Math.min(p.life / this.maxLife, 1);
            const particleAlpha = (1 - particleT) * this.alpha;
            const particleSize = p.size * (1 - particleT * 0.5);

            if (particleAlpha > 0.01 && particleSize > 0.5) {
                this.circle(p.x, p.y, particleSize);
                this.fill({ color: p.color, alpha: particleAlpha });
            }
        }

        // Draw flash circle at the beginning
        if (t < 0.1) {
            const flashT = t / 0.1;
            const flashAlpha = (1 - flashT) * 0.8;
            const flashSize = 50 + flashT * 100;

            this.circle(0, 0, flashSize);
            this.fill({ color: 0xffffff, alpha: flashAlpha });

            this.circle(0, 0, flashSize * 0.7);
            this.fill({ color: 0xff6600, alpha: flashAlpha * 0.5 });
        }
    }

    isAlive(): boolean {
        return this.visible && this.life < this.maxLife;
    }
}

export class ExplosionPool {
    private pool: ExplosionGraphic[] = [];
    private container: PIXI.Container;

    constructor(container: PIXI.Container) {
        this.container = container;
    }

    private getExplosion(): ExplosionGraphic {
        let explosion = this.pool.find(e => !e.visible);
        if (!explosion) {
            explosion = new ExplosionGraphic();
            explosion.blendMode = 'add'; // Additive blending for better effect
            this.pool.push(explosion);
            this.container.addChild(explosion);
        }
        return explosion;
    }

    spawn(x: number, y: number) {
        const explosion = this.getExplosion();
        explosion.spawn(x, y);
    }

    tick(dt: number) {
        for (const explosion of this.pool) {
            if (explosion.visible) {
                explosion.tick(dt);
            }
        }
    }
}
