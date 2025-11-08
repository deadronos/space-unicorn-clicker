// Lightweight wrapper around PIXI.Graphics for a single beam graphic
export default class BeamGraphic {
  app: any
  graphics: any

  constructor(app: any, opts?: any) {
    this.app = app
    const PIXI = (globalThis as any).PIXI
    if (!PIXI || !PIXI.Graphics) return

    try {
      this.graphics = new PIXI.Graphics()
      try {
        const w = (app && app.view && (app.view.width || app.view.clientWidth)) || 100
        const h = (app && app.view && (app.view.height || app.view.clientHeight)) || 100
        const x0 = opts?.x0 ?? Math.floor(w * 0.25)
        const y0 = opts?.y0 ?? Math.floor(h * 0.5)
        const x1 = opts?.x1 ?? Math.floor(w * 0.75)
        const y1 = opts?.y1 ?? Math.floor(h * 0.5)
        const width = opts?.width ?? 2
        const color = typeof opts?.color === 'number' ? opts.color : 0xff00ff

        if (typeof this.graphics.lineStyle === 'function') this.graphics.lineStyle(width, color)
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
      if (typeof this.graphics.clear === 'function') this.graphics.clear()
      if (this.app && this.app.stage && typeof this.app.stage.removeChild === 'function') {
        this.app.stage.removeChild(this.graphics)
      }
      if (typeof this.graphics.destroy === 'function') this.graphics.destroy()
    } catch (e) {
      // ignore
    }
  }
}
