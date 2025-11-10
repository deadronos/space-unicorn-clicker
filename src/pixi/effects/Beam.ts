import BeamGraphic from '../display/BeamGraphic';

export class Beam {
  private static _nextId = 1
  public readonly id: number
  public active: boolean = false
  private _timer: ReturnType<typeof setTimeout> | null = null
  private _onFinish?: () => void
  public display: any = null

  constructor() {
    this.id = Beam._nextId++
  }

  play(opts?: { duration?: number; onFinish?: () => void; app?: any; pixiOpts?: any }): void {
    const duration = opts?.duration ?? 0
    this._onFinish = opts?.onFinish
    this.active = true

    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }

    // If a PIXI app is provided and PIXI is available, create a display object
    try {
      const app = opts?.app
      const PIXI = (globalThis as any).PIXI
      if (app && PIXI && PIXI.Graphics) {
        try {
          this.display = new BeamGraphic(app, opts?.pixiOpts ?? opts)
          try { console.info && console.info('Beam: created PIXI display', { id: this.id, display: this.display }); } catch (e) {}
        } catch (e) {
          // ignore display failures
        }
      }
    } catch (e) {
      // ignore
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

    // destroy any attached display
    try {
      if (this.display && typeof this.display.destroy === 'function') {
        try {
          this.display.destroy()
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
    this.display = undefined

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
    // ensure display is cleaned
    try {
      if (this.display && typeof this.display.destroy === 'function') {
        try { this.display.destroy() } catch (e) {}
      }
    } catch (e) {}
    this.display = undefined

    this.active = false
    this._onFinish = undefined
  }
}
