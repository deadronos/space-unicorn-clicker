/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { ComboBurstPool } from '../display/ComboBurstGraphic'

describe('ComboBurstPool', () => {
  it('spawns and ticks without throwing', () => {
    const mockStage = { addChild: () => {}, removeChild: () => {} } as any
    const pool = new ComboBurstPool(mockStage)
    expect(() => pool.spawn(10, 20)).not.toThrow()
    pool.tick(16)
  })
})
