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
        // Removed zIndex to rely on insertion order (added first = bottom)
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
        // Slightly increased size for better visibility
        const size = Math.max(1.5, 4 / z);
        const alpha = Math.min(1, 2 / z);
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

    public resize(width: number, height: number) {
        if (this.width === width && this.height === height) return;

        // If we are resizing from a very small initial size to a larger one (initial load),
        // redistribute stars so they don't clump in the top-left.
        const isInitialExpand = (this.width < 200 && width > 200);

        this.width = width;
        this.height = height;

        if (isInitialExpand) {
            for (const star of this.stars) {
                star.sprite.x = Math.random() * width;
                star.sprite.y = Math.random() * height;
            }
        }
    }

    public update(delta: number) {
        const { width, height } = this.app.screen;

        // Ensure internal dimensions match screen if resize wasn't called manually
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;
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
