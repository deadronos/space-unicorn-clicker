// Lightweight wrapper around PIXI.Graphics for a single beam graphic
export default class BeamGraphic {
  app: any
  graphics: any
  private _fadeTick: any = null
  private _rafId: number | null = null

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
      } catch (e) { }
      // reset alpha so pooled graphics don't stay faded
      try { g.alpha = 1 } catch (e) { }
      try { if ((g as any).__beamDebug) delete (g as any).__beamDebug } catch (e) { }
      // make invisible until reused
      try {
        g.visible = false
      } catch (e) { }
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
        // ensure graphic is visible when reused from pool
        try { this.graphics.visible = true } catch (e) { }

        // Determine stroke color (support hex string like '#60a5fa')
        let colorNum: number | undefined = undefined
        if (typeof opts?.color === 'number') colorNum = opts.color
        else if (typeof opts?.color === 'string' && /^#?[0-9a-fA-F]{6}$/.test(opts.color)) {
          const hex = opts.color.replace('#', '')
          try { colorNum = parseInt(hex, 16) } catch (e) { colorNum = undefined }
        }
        if (typeof colorNum === 'undefined') colorNum = 0xffffff

        // Prefer the newer setStrokeStyle API if available (PIXI v8+); fall back
        // to the older lineStyle when necessary. Always attempt to set a color
        // to avoid invisible lines on dark backgrounds.
        const view = app && ((app.canvas as any) ?? (app.view as any))
        // Prefer CSS pixel sizes (clientWidth/clientHeight) for coordinate calculations
        // so inputs expressed in CSS pixels (from getBoundingClientRect) match Pixi's
        // logical coordinate space. Fall back to the canvas width/height properties
        // (device pixels) when client sizes are unavailable.
        const w = (view && (view.clientWidth || view.width)) || 100
        const h = (view && (view.clientHeight || view.height)) || 100
        const x0 = opts?.x0 ?? Math.floor(w * 0.25)
        const y0 = opts?.y0 ?? Math.floor(h * 0.5)
        const x1 = opts?.x1 ?? Math.floor(w * 0.75)
        const y1 = opts?.y1 ?? Math.floor(h * 0.5)

        try { console.info && console.info('BeamGraphic: coords', { x0, y0, x1, y1, viewClientWidth: view && (view.clientWidth || view.width), viewClientHeight: view && (view.clientHeight || view.height), opts }); } catch (e) { }
        try { if (this.graphics) (this.graphics as any).__beamDebug = { x0, y0, x1, y1, w, h, opts }; } catch (e) { }

        // Draw Glow
        if (typeof this.graphics.setStrokeStyle === 'function') {
          try { this.graphics.setStrokeStyle({ width: (opts?.width ?? 2) * 4, color: colorNum, alpha: 0.3, cap: 'round', join: 'round', alignment: 0.5 }); } catch (e) { }
        } else if (typeof this.graphics.lineStyle === 'function') {
          try { this.graphics.lineStyle((opts?.width ?? 2) * 4, colorNum, 0.3); } catch (e) { }
        }

        if (typeof this.graphics.moveTo === 'function') this.graphics.moveTo(x0, y0)
        if (typeof this.graphics.lineTo === 'function') this.graphics.lineTo(x1, y1)
        if (typeof this.graphics.stroke === 'function') this.graphics.stroke()

        // Draw Core
        if (typeof this.graphics.setStrokeStyle === 'function') {
          try { this.graphics.setStrokeStyle({ width: opts?.width ?? 2, color: 0xffffff, alpha: 1, cap: 'round', join: 'round', alignment: 0.5 }); } catch (e) { }
        } else if (typeof this.graphics.lineStyle === 'function') {
          try { this.graphics.lineStyle(opts?.width ?? 2, 0xffffff, 1); } catch (e) { }
        }

        if (typeof this.graphics.moveTo === 'function') this.graphics.moveTo(x0, y0)
        if (typeof this.graphics.lineTo === 'function') this.graphics.lineTo(x1, y1)
        // Commit the stroke for Pixi v8 path API
        if (typeof this.graphics.stroke === 'function') this.graphics.stroke()

        // Ensure alpha is reset when drawing and start a fade animation
        try { this.graphics.alpha = 1 } catch (e) { }
        const durationMs = opts?.duration ?? 0
        try {
          if (durationMs > 0) {
            const ticker = this.app && this.app.ticker
            const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
            const tick = () => {
              try {
                const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
                const elapsed = now - start
                const t = Math.min(1, elapsed / durationMs)
                try { this.graphics.alpha = 1 - t } catch (e) { }
                if (t >= 1) {
                  try { if (ticker && typeof ticker.remove === 'function') ticker.remove(tick) } catch (e) { }
                  this._fadeTick = null
                }
              } catch (e) {
                // ignore per-frame errors
              }
            }

            if (ticker && typeof ticker.add === 'function') {
              try { ticker.add(tick) } catch (e) { }
              this._fadeTick = tick
            } else if (typeof requestAnimationFrame === 'function') {
              const loop = () => {
                try {
                  const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
                  const elapsed = now - start
                  const t = Math.min(1, elapsed / durationMs)
                  try { this.graphics.alpha = 1 - t } catch (e) { }
                  if (t >= 1) {
                    this._rafId = null
                    return
                  }
                } catch (e) { }
                this._rafId = requestAnimationFrame(loop)
              }
              this._rafId = requestAnimationFrame(loop)
            }
          }
        } catch (e) {
          // ignore animation setup errors
        }
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
        // clean up any running animation callbacks
        try {
          if (this._fadeTick && this.app && this.app.ticker && typeof this.app.ticker.remove === 'function') {
            try { this.app.ticker.remove(this._fadeTick) } catch (e) { }
            this._fadeTick = null
          }
        } catch (e) { }
        try {
          if (this._rafId) {
            try { cancelAnimationFrame(this._rafId) } catch (e) { }
            this._rafId = null
          }
        } catch (e) { }

        if (this.app && this.app.stage && typeof this.app.stage.removeChild === 'function') {
          this.app.stage.removeChild(this.graphics)
        }
      } catch (e) { }
      BeamGraphic.release(this.graphics)
      this.graphics = null
    } catch (e) {
      // ignore
    }
  }
}
