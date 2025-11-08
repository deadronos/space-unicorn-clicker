import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BeamPool } from './effects/BeamPool'

describe('BeamPool', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allocates and recycles beams', () => {
    const pool = new BeamPool()
    pool.spawn(500)
    expect(pool.getActiveCount()).toBe(1)

    vi.advanceTimersByTime(500)

    expect(pool.getActiveCount()).toBe(0)
    expect(pool.getPoolLength()).toBeGreaterThan(0)
  })

  it('reuses beam instances', () => {
    const pool = new BeamPool()
    const b1 = pool.spawn(200)
    const id1 = b1.id
    expect(pool.getActiveCount()).toBe(1)

    vi.advanceTimersByTime(200)
    expect(pool.getActiveCount()).toBe(0)

    const b2 = pool.spawn(200)
    expect(b2.id).toBe(id1)
  })
})
