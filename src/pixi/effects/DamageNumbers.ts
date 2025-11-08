export class DamageNumber {
  id: number
  active: boolean = false
  value: number = 0
  timer?: ReturnType<typeof setTimeout>
  private onFinish?: () => void

  constructor(id: number) {
    this.id = id
  }

  play(value: number, opts?: { duration?: number; onFinish?: () => void }): void {
    const duration = opts?.duration ?? 300
    this.value = value
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

  spawn(value: number, duration: number = 300): DamageNumber {
    const d = this.alloc()
    d.play(value, { duration, onFinish: () => this.release(d) })
    return d
  }

  getPoolLength(): number {
    return this.pool.length
  }

  getActiveCount(): number {
    return this.pool.filter(d => d.active).length
  }
}
