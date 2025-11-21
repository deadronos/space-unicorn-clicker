import * as PIXI from 'pixi.js';

export class Starfield {
    private app: PIXI.Application;
    private container: PIXI.Container;
    private stars: { sprite: PIXI.Graphics; z: number; speed: number }[] = [];
    private width: number = 0;
    private height: number = 0;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.zIndex = -1; // Ensure it's behind everything
        this.app.stage.addChild(this.container);
        this.initStars();
    }

    private initStars() {
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            this.createStar();
        }
    }

    private createStar() {
        const z = Math.random() * 3 + 1; // Depth factor (1 is close, 4 is far)
        const size = Math.max(0.5, 3 / z);
        const alpha = Math.min(1, 1.5 / z);
        const speed = 0.2 / z;

        const g = new PIXI.Graphics();
        g.circle(0, 0, size);
        g.fill({ color: 0xffffff, alpha });

        // Random position initially
        g.x = Math.random() * this.app.screen.width;
        g.y = Math.random() * this.app.screen.height;

        this.container.addChild(g);
        this.stars.push({ sprite: g, z, speed });
    }

    public update(delta: number) {
        const { width, height } = this.app.screen;

        // Re-init if resized significantly (optional, but good for responsiveness)
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;
            // Could reposition stars here if needed, but wrapping logic handles it
        }

        for (const star of this.stars) {
            star.sprite.y += star.speed * delta * 2; // Move downwards

            // Wrap around
            if (star.sprite.y > height) {
                star.sprite.y = -5;
                star.sprite.x = Math.random() * width;
            }
        }
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
