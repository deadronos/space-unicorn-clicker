import DamageNumberGraphic from '../display/DamageNumberGraphic'

export class DamageNumber {
  id: number
  active: boolean = false
  value: number = 0
  timer?: ReturnType<typeof setTimeout>
  private onFinish?: () => void
  public display: any = null

  constructor(id: number) {
    this.id = id
  }

  play(value: number, opts?: { duration?: number; onFinish?: () => void; app?: any; pixiOpts?: any }): void {
    const duration = opts?.duration ?? 300
    this.value = value
    this.active = true
    this.onFinish = opts?.onFinish
    if (this.timer) clearTimeout(this.timer)

    try {
      const app = opts?.app
      const PIXI = (globalThis as any).PIXI
      if (app && PIXI && PIXI.Text) {
        try {
          const existing = (opts?.pixiOpts && opts.pixiOpts.existingText) || undefined
          this.display = new DamageNumberGraphic(app, Object.assign({}, opts?.pixiOpts || {}, { existingText: existing, value }))
        } catch (e) {}
      }
    } catch (e) {}

    this.timer = setTimeout(() => {
      this.finish()
      if (this.onFinish) this.onFinish()
    }, duration)
  }

  finish(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    try {
      if (this.display && typeof this.display.destroy === 'function') {
        try { this.display.destroy() } catch (e) {}
      }
    } catch (e) {}
    this.display = undefined
    this.active = false
  }

  reset(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    try {
      if (this.display && typeof this.display.destroy === 'function') {
        try { this.display.destroy() } catch (e) {}
      }
    } catch (e) {}
    this.display = undefined
    this.active = false
    this.value = 0
    this.onFinish = undefined
  }
}

export class DamageNumberPool {
  private pool: DamageNumber[] = []
  private nextId = 1

  alloc(): DamageNumber {
    const free = this.pool.find(d => !d.active)
    if (free) return free
    const d = new DamageNumber(this.nextId++)
    this.pool.push(d)
    return d
  }

  release(d: DamageNumber): void {
    d.reset()
    if (!this.pool.includes(d)) this.pool.push(d)
  }

  spawn(value: number, duration: number = 300, opts?: { app?: any; pixiOpts?: any }): DamageNumber {
    const d = this.alloc()
    if (opts && opts.app && (globalThis as any).PIXI && (globalThis as any).PIXI.Text) {
      try {
        const PIXI = (globalThis as any).PIXI
        const existing = (DamageNumberGraphic as any).alloc(PIXI)
        const pixiOpts = Object.assign({}, opts.pixiOpts || {}, { existingText: existing })
        d.play(value, { duration, onFinish: () => this.release(d), app: opts.app, pixiOpts })
      } catch (e) {
        d.play(value, { duration, onFinish: () => this.release(d) })
      }
    } else {
      d.play(value, { duration, onFinish: () => this.release(d) })
    }
    return d
  }

  getPoolLength(): number {
    return this.pool.length
  }

  getActiveCount(): number {
    return this.pool.filter(d => d.active).length
  }
}
