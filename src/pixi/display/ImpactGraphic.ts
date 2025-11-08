// Lightweight wrapper for a simple impact graphic (circle) using PIXI.Graphics
export default class ImpactGraphic {
  app: any
  graphics: any

  private static _pool: any[] = []

  static alloc(PIXI: any) {
    if (this._pool.length) return this._pool.pop()
    return new PIXI.Graphics()
  }

  static release(g: any) {
    try {
      if (!g) return
      if (typeof g.clear === 'function') g.clear()
      try {
        if (typeof g.removeChildren === 'function') g.removeChildren()
      } catch (e) {}
      try { g.visible = false } catch (e) {}
      this._pool.push(g)
    } catch (e) {
      // ignore
    }
  }

  constructor(app: any, opts?: any) {
    this.app = app
    const PIXI = (globalThis as any).PIXI
    if (!PIXI || !PIXI.Graphics) return

    try {
      if (opts && opts.existingGraphic) {
        this.graphics = opts.existingGraphic
      } else {
        this.graphics = (ImpactGraphic as any).alloc(PIXI)
      }

      try {
        if (typeof this.graphics.clear === 'function') this.graphics.clear()
        const w = (app && app.view && (app.view.width || app.view.clientWidth)) || 100
        const h = (app && app.view && (app.view.height || app.view.clientHeight)) || 100
        const cx = opts?.x ?? Math.floor(w / 2)
        const cy = opts?.y ?? Math.floor(h / 2)
        const r = opts?.r ?? 6
        const color = typeof opts?.color === 'number' ? opts.color : 0xffff00

        if (typeof this.graphics.beginFill === 'function') this.graphics.beginFill(color)
        if (typeof this.graphics.drawCircle === 'function') this.graphics.drawCircle(cx, cy, r)
        if (typeof this.graphics.endFill === 'function') this.graphics.endFill()
      } catch (e) {
        // ignore drawing errors
      }

      try {
        if (this.app && this.app.stage && typeof this.app.stage.addChild === 'function') {
          this.app.stage.addChild(this.graphics)
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }

  destroy() {
    try {
      if (!this.graphics) return
      try {
        if (this.app && this.app.stage && typeof this.app.stage.removeChild === 'function') {
          this.app.stage.removeChild(this.graphics)
        }
      } catch (e) {}
      ImpactGraphic.release(this.graphics)
      this.graphics = null
    } catch (e) {
      // ignore
    }
  }
}
