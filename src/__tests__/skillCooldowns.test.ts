import { describe, it, expect } from 'vitest';
import { activateSkill, createFreshGameState, deriveStats, getSkillCooldownMultiplier } from '../logic';

describe('skill cooldowns', () => {
    it('reduces skill cooldowns when Chrono Resonance is active', () => {
        const game = createFreshGameState();
        game.artifacts['chrono_resonance'] = 3;

        expect(getSkillCooldownMultiplier(game)).toBeCloseTo(1 / 1.3);

        const derived = deriveStats(game);
        expect(derived.skillCooldownMult).toBeCloseTo(1 / 1.3);

        const updated = activateSkill(game, 'overcharge');
        expect(updated.skills['overcharge'].cooldownRemaining).toBe(46154);
    });
});
