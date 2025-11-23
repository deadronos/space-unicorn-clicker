import BeamGraphic from '../display/BeamGraphic';

export class Beam {
  private static _nextId = 1
  public readonly id: number
  public active: boolean = false
  private _timer: ReturnType<typeof setTimeout> | null = null
  private _onFinish?: () => void
  public display: any = null
  private _startTs: number | null = null

  constructor() {
    this.id = Beam._nextId++
  }

  play(opts?: { duration?: number; onFinish?: () => void; app?: any; pixiOpts?: any }): void {
    const duration = opts?.duration ?? 0
    this._onFinish = opts?.onFinish
    this.active = true

    try {
      this._startTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      // try { console.info && console.info('Beam.play start', { id: this.id, duration }) } catch (e) {}
    } catch (e) {}

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
          // Ensure the duration is available to the Pixi display so it can
          // perform its own alpha fade animation. Prefer duration in
          // opts.pixiOpts but fall back to the top-level duration.
          const displayOpts = Object.assign({}, opts?.pixiOpts || opts || {}, { duration })
          this.display = new BeamGraphic(app, displayOpts)
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

    try {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      if (this._startTs) {
        try { console.info && console.info('Beam.finish elapsed', { id: this.id, elapsed: Math.round(now - this._startTs) }) } catch (e) {}
      }
    } catch (e) {}

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
