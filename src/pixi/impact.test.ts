/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ImpactParticles } from './effects/ImpactParticles'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ImpactParticles', () => {
  const mockApp = {
    stage: { addChild: vi.fn(), removeChild: vi.fn() },
    renderer: { generateTexture: vi.fn() }
  }

  it('spawn and recycle particles', () => {
    const pool = new ImpactParticles()
    const particles = pool.spawn(0, 0, 3, 400, { app: mockApp })
    expect(pool.getActiveCount()).toBe(3)
    vi.advanceTimersByTime(600)
    expect(pool.getActiveCount()).toBe(0)
    expect(pool.getPoolLength()).toBeGreaterThanOrEqual(3)
  })

  it('reuses particle instances', () => {
    const pool = new ImpactParticles()
    const first = pool.spawn(0, 0, 3, 400, { app: mockApp })
    const ids1 = first.map(p => p.id)
    vi.advanceTimersByTime(400)
    const second = pool.spawn(0, 0, 3, 400, { app: mockApp })
    const ids2 = second.map(p => p.id)
    const reused = ids2.some(id => ids1.includes(id))
    expect(reused).toBe(true)
  })
})
