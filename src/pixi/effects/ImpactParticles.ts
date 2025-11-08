export class Particle {
  id: number
  active: boolean = false
  timer?: ReturnType<typeof setTimeout>
  private onFinish?: () => void

  constructor(id: number) {
    this.id = id
  }

  play(opts?: { duration?: number; onFinish?: () => void }): void {
    const duration = opts?.duration ?? 300
    this.active = true
    this.onFinish = opts?.onFinish
    if (this.timer) clearTimeout(this.timer)
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
    this.active = false
  }

  reset(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
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

  spawn(x: number, y: number, count: number = 1, duration: number = 300): Particle[] {
    const out: Particle[] = []
    for (let i = 0; i < count; i++) {
      const p = this.alloc()
      out.push(p)
      p.play({ duration, onFinish: () => this.release(p) })
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
