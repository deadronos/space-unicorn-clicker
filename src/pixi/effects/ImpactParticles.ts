import ImpactGraphic from '../display/ImpactGraphic'

export class Particle {
  id: number
  active: boolean = false
  timer?: ReturnType<typeof setTimeout>
  private onFinish?: () => void
  public display: any = null

  constructor(id: number) {
    this.id = id
  }

  play(opts?: { duration?: number; onFinish?: () => void; app?: any; pixiOpts?: any }): void {
    const duration = opts?.duration ?? 300
    this.active = true
    this.onFinish = opts?.onFinish
    if (this.timer) clearTimeout(this.timer)

    // create pixi display if app provided
    try {
      const app = opts?.app
      const PIXI = (globalThis as any).PIXI
      if (app && PIXI && PIXI.Graphics) {
        try {
          const existing = (opts?.pixiOpts && opts.pixiOpts.existingGraphic) || undefined
          this.display = new ImpactGraphic(app, Object.assign({}, opts?.pixiOpts || {}, { existingGraphic: existing }))
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
    // destroy display if present
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
    this.onFinish = undefined
  }
}

export class ImpactParticles {
  private pool: Particle[] = []
  private nextId = 1

  alloc(): Particle {
    const free = this.pool.find(p => !p.active)
    if (free) return free
    const p = new Particle(this.nextId++)
    this.pool.push(p)
    return p
  }

  release(p: Particle): void {
    p.reset()
    if (!this.pool.includes(p)) this.pool.push(p)
  }

  spawn(x: number, y: number, count: number = 1, duration: number = 300, opts?: { app?: any; pixiOpts?: any }): Particle[] {
    const out: Particle[] = []
    for (let i = 0; i < count; i++) {
      const p = this.alloc()
      out.push(p)
      const pixiOpts = Object.assign({}, opts?.pixiOpts || {}, { x, y })
      p.play({ duration, onFinish: () => this.release(p), app: opts?.app, pixiOpts })
    }
    return out
  }

  getPoolLength(): number {
    return this.pool.length
  }

  getActiveCount(): number {
    return this.pool.filter(p => p.active).length
  }
}
