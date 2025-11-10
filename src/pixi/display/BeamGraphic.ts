// Lightweight wrapper around PIXI.Graphics for a single beam graphic
export default class BeamGraphic {
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
      // make invisible until reused
      try {
        g.visible = false
      } catch (e) {}
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
        this.graphics = (BeamGraphic as any).alloc(PIXI)
      }

      try {
        // reset and draw
        if (typeof this.graphics.clear === 'function') this.graphics.clear()
        // Prefer the newer setStrokeStyle API if available (PIXI v8+); fall back
        // to the older lineStyle when necessary.
        if (typeof this.graphics.setStrokeStyle === 'function') {
          try { this.graphics.setStrokeStyle(opts?.width ?? 2); } catch (e) {}
        } else if (typeof this.graphics.lineStyle === 'function') {
          try { this.graphics.lineStyle(opts?.width ?? 2, typeof opts?.color === 'number' ? opts.color : 0xff00ff); } catch (e) {}
        }

        const view = app && ((app.canvas as any) ?? (app.view as any))
        const w = (view && (view.width || view.clientWidth)) || 100
        const h = (view && (view.height || view.clientHeight)) || 100
        const x0 = opts?.x0 ?? Math.floor(w * 0.25)
        const y0 = opts?.y0 ?? Math.floor(h * 0.5)
        const x1 = opts?.x1 ?? Math.floor(w * 0.75)
        const y1 = opts?.y1 ?? Math.floor(h * 0.5)

        if (typeof this.graphics.moveTo === 'function') this.graphics.moveTo(x0, y0)
        if (typeof this.graphics.lineTo === 'function') this.graphics.lineTo(x1, y1)
      } catch (e) {
        // drawing best-effort
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
      BeamGraphic.release(this.graphics)
      this.graphics = null
    } catch (e) {
      // ignore
    }
  }
}
