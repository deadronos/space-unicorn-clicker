// Lightweight wrapper for a simple impact graphic (circle) using PIXI.Graphics
export default class ImpactGraphic {
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
