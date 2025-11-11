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
        try { this.graphics.visible = true } catch (e) {}
        const view = app && ((app.canvas as any) ?? (app.view as any))
        // Prefer CSS pixel sizes (clientWidth/clientHeight) for coordinate calculations
        // so inputs expressed in CSS pixels (from getBoundingClientRect) match Pixi's
        // logical coordinate space. Fall back to the canvas width/height properties
        // (device pixels) when client sizes are unavailable.
        const w = (view && (view.clientWidth || view.width)) || 100
        const h = (view && (view.clientHeight || view.height)) || 100
        const cx = opts?.x ?? Math.floor(w / 2)
        const cy = opts?.y ?? Math.floor(h / 2)
        const r = opts?.r ?? 6
        const color = typeof opts?.color === 'number' ? opts.color : 0xffff00

        // Prefer modern Pixi v8 API if available: `fill` + `circle`.
        if (typeof this.graphics.fill === 'function') {
          try {
            // v8: specify fill style as an object
            try { this.graphics.fill({ color }); } catch (e) { /* best-effort */ }
            if (typeof this.graphics.circle === 'function') {
              this.graphics.circle(cx, cy, r)
            } else if (typeof this.graphics.drawCircle === 'function') {
              // older name fallback
              this.graphics.drawCircle(cx, cy, r)
            }
            // Commit the filled shape for v8 path API.
            if (typeof this.graphics.fill === 'function' && typeof this.graphics.endFill !== 'function') {
              // nothing extra needed; path fill already committed
            }
          } catch (e) {
            // fallback to legacy API if v8-style calls fail
            if (typeof this.graphics.beginFill === 'function') this.graphics.beginFill(color)
            if (typeof this.graphics.drawCircle === 'function') this.graphics.drawCircle(cx, cy, r)
            if (typeof this.graphics.endFill === 'function') this.graphics.endFill()
          }
        } else {
          // legacy PIXI: beginFill/drawCircle/endFill
          if (typeof this.graphics.beginFill === 'function') this.graphics.beginFill(color)
          if (typeof this.graphics.drawCircle === 'function') this.graphics.drawCircle(cx, cy, r)
          if (typeof this.graphics.endFill === 'function') this.graphics.endFill()
        }
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
