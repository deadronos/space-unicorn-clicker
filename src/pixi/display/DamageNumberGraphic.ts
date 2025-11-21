// Lightweight wrapper for a floating damage number using PIXI.Text
export default class DamageNumberGraphic {
  app: any
  text: any

  private static _pool: any[] = []

  static alloc(PIXI: any) {
    if (this._pool.length) return this._pool.pop()
    try {
      // Prefer the newer Text API (PIXI v8+): `new Text({ text, style })`.
      try {
        return new PIXI.Text({ text: '', style: { fill: 0xffffff, fontSize: 14 } })
      } catch (e) {
        // Fallback to the legacy constructor signature
        return new PIXI.Text('', { fill: 0xffffff, fontSize: 14 })
      }
    } catch (e) {
      return null
    }
  }

  static release(t: any) {
    try {
      if (!t) return
      try { t.text = '' } catch (e) { }
      try { t.visible = false } catch (e) { }
      this._pool.push(t)
    } catch (e) {
      // ignore
    }
  }

  constructor(app: any, opts?: any) {
    this.app = app
    const PIXI = (globalThis as any).PIXI
    if (!PIXI || !PIXI.Text) return

    try {
      if (opts && opts.existingText) {
        this.text = opts.existingText
      } else {
        this.text = (DamageNumberGraphic as any).alloc(PIXI)
      }

      try {
        if (typeof this.text.setText === 'function') this.text.text = String(opts?.value ?? '')
        else this.text.text = String(opts?.value ?? '')

        // Apply custom style if provided
        if (opts?.style) {
          try { this.text.style = opts.style } catch (e) { }
        }
      } catch (e) { }

      try {
        const x = opts?.x ?? 0
        const y = opts?.y ?? 0
        if (typeof this.text.position !== 'undefined') {
          try { this.text.position.x = x } catch (e) { }
          try { this.text.position.y = y } catch (e) { }
        } else if (typeof this.text.x !== 'undefined') {
          try { this.text.x = x } catch (e) { }
          try { this.text.y = y } catch (e) { }
        }
      } catch (e) { }

      try {
        if (this.app && this.app.stage && typeof this.app.stage.addChild === 'function') {
          this.app.stage.addChild(this.text)
        }
      } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  destroy() {
    try {
      if (!this.text) return
      try {
        if (this.app && this.app.stage && typeof this.app.stage.removeChild === 'function') {
          this.app.stage.removeChild(this.text)
        }
      } catch (e) { }
      DamageNumberGraphic.release(this.text)
      this.text = null
    } catch (e) {
      // ignore
    }
  }
}
