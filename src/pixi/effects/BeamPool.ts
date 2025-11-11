import { Beam } from './Beam'
import BeamGraphic from '../display/BeamGraphic'

export class BeamPool {
  private pool: Beam[] = []
  private active: Set<Beam> = new Set()

  alloc(): Beam {
    const b = this.pool.pop() ?? new Beam()
    b.reset()
    return b
  }

  release(beam: Beam): void {
    if (this.active.has(beam)) {
      this.active.delete(beam)
    }
    beam.reset()
    this.pool.push(beam)
  }

  spawn(duration?: number, opts?: { app?: any; pixiOpts?: any }): Beam {
    const beam = this.alloc()
    this.active.add(beam)

    if (opts && opts.app && (globalThis as any).PIXI && (globalThis as any).PIXI.Graphics) {
      // Allocate a Graphics from the display pool and hand it to the Beam via pixiOpts
      try {
        const PIXI = (globalThis as any).PIXI
        const gfx = (BeamGraphic as any).alloc(PIXI)
        const pixiOpts = Object.assign({}, opts.pixiOpts || {}, { existingGraphic: gfx, duration: duration ?? 0 })
        try { console.info && console.info('BeamPool: spawning PIXI beam with pixiOpts', pixiOpts); } catch (e) {}
        beam.play({ duration: duration ?? 0, onFinish: () => this.release(beam), app: opts.app, pixiOpts })
      } catch (e) {
        // Fallback: just play without preallocated graphic
        beam.play({ duration: duration ?? 0, onFinish: () => this.release(beam) })
      }
    } else {
      beam.play({ duration: duration ?? 0, onFinish: () => this.release(beam) })
    }

    return beam
  }

  getPoolLength(): number {
    return this.pool.length
  }

  getActiveCount(): number {
    return this.active.size
  }
}
