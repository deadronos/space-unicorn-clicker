export class Beam {
  private static _nextId = 1
  public readonly id: number
  public active: boolean = false
  private _timer: ReturnType<typeof setTimeout> | null = null
  private _onFinish?: () => void

  constructor() {
    this.id = Beam._nextId++
  }

  play(opts?: { duration?: number; onFinish?: () => void }): void {
    const duration = opts?.duration ?? 0
    this._onFinish = opts?.onFinish
    this.active = true

    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }

    this._timer = setTimeout(() => {
      this.finish()
    }, duration)
  }

  finish(): void {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }

    this.active = false

    const cb = this._onFinish
    this._onFinish = undefined
    if (cb) cb()
  }

  reset(): void {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
    this.active = false
    this._onFinish = undefined
  }
}
