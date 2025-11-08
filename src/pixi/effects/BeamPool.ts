import { Beam } from './Beam'

export class BeamPool {
  private pool: Beam[] = []
  private active: Set<Beam> = new Set()

  alloc(): Beam {
    const b = this.pool.pop() ?? new Beam()
    return b
  }

  release(beam: Beam): void {
    if (this.active.has(beam)) {
      this.active.delete(beam)
    }
    beam.reset()
    this.pool.push(beam)
  }

  spawn(duration?: number): Beam {
    const beam = this.alloc()
    this.active.add(beam)
    beam.play({ duration: duration ?? 0, onFinish: () => this.release(beam) })
    return beam
  }

  getPoolLength(): number {
    return this.pool.length
  }

  getActiveCount(): number {
    return this.active.size
  }
}
