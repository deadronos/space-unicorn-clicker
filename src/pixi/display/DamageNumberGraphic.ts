// Lightweight wrapper for a floating damage number using PIXI.Text
export default class DamageNumberGraphic {
  app: any
  text: any
  life: number = 0
  maxLife: number = 0
  startY: number = 0

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
      try { t.alpha = 1 } catch (e) { }
      try { t.scale.set(1) } catch (e) { }
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

        // Reset transform
        this.text.alpha = 1;
        this.text.scale.set(0.5); // Start small
      } catch (e) { }

      try {
        const x = opts?.x ?? 0
        const y = opts?.y ?? 0
        this.startY = y;

        if (typeof this.text.position !== 'undefined') {
          try { this.text.position.x = x } catch (e) { }
          try { this.text.position.y = y } catch (e) { }
        } else if (typeof this.text.x !== 'undefined') {
          try { this.text.x = x } catch (e) { }
          try { this.text.y = y } catch (e) { }
        }

        // Center anchor for better scaling
        try { this.text.anchor.set(0.5) } catch (e) { }
      } catch (e) { }

      try {
        if (this.app && this.app.stage && typeof this.app.stage.addChild === 'function') {
          this.app.stage.addChild(this.text)
        }
        // Add to ticker
        if (this.app && this.app.ticker) {
          this.app.ticker.add(this.update, this);
        }
      } catch (e) { }

      // Set lifetime (approximate based on duration passed or default)
      // Note: The pool handles the actual destruction timeout, this is just for animation math
      this.maxLife = 60; // approx 1 second at 60fps
      this.life = 0;

    } catch (e) {
      // ignore
    }
  }

  update(ticker: any) {
    if (!this.text) return;
    const dt = ticker.deltaTime;
    this.life += dt;

    const t = Math.min(this.life / this.maxLife, 1);

    // Pop effect: Scale up quickly then settle
    let scale = 1;
    if (t < 0.2) {
      scale = 0.5 + (t / 0.2) * 1.0; // 0.5 -> 1.5
    } else if (t < 0.4) {
      scale = 1.5 - ((t - 0.2) / 0.2) * 0.5; // 1.5 -> 1.0
    }

    try {
      this.text.scale.set(scale);

      // Float up
      this.text.y = this.startY - (t * 50); // Move up 50px

      // Fade out near end
      if (t > 0.7) {
        this.text.alpha = 1 - ((t - 0.7) / 0.3);
      }
    } catch (e) { }
  }

  destroy() {
    try {
      if (this.app && this.app.ticker) {
        this.app.ticker.remove(this.update, this);
      }

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
