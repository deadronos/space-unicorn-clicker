import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DamageNumberPool } from './effects/DamageNumbers'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DamageNumberPool', () => {
  it('spawn and recycle damage numbers', () => {
    const pool = new DamageNumberPool()
    const dn = pool.spawn(123, 300)
    expect(pool.getActiveCount()).toBe(1)
    expect(dn.value).toBe(123)
    vi.advanceTimersByTime(300)
    expect(pool.getActiveCount()).toBe(0)
    expect(pool.getPoolLength()).toBeGreaterThanOrEqual(1)
  })

  it('reuses instances', () => {
    const pool = new DamageNumberPool()
    const first = pool.spawn(1, 200)
    const id1 = first.id
    vi.advanceTimersByTime(200)
    const second = pool.spawn(2, 200)
    const id2 = second.id
    const reused = id1 === id2
    expect(reused).toBe(true)
  })
})
