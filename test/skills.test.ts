import { describe, it, expect } from 'vitest';
import { createFreshGameState, tickSkills, activateSkill, deriveStats } from '../src/logic';
import { SKILL_DEFS } from '../src/skills';

describe('Skills Logic', () => {
    it('initializes with empty skills but tick adds them', () => {
        const game = createFreshGameState();
        expect(game.skills).toEqual({});

        const ticked = tickSkills(game, 100);
        expect(Object.keys(ticked.skills)).toHaveLength(SKILL_DEFS.length);
        expect(ticked.skills['overcharge'].cooldownRemaining).toBe(0);
    });

    it('activates a skill and sets cooldown', () => {
        let game = createFreshGameState();
        game = tickSkills(game, 0); // Init

        game = activateSkill(game, 'overcharge');
        const skill = game.skills['overcharge'];

        expect(skill.activeRemaining).toBe(SKILL_DEFS.find(s=>s.id==='overcharge')!.duration);
        expect(skill.cooldownRemaining).toBe(SKILL_DEFS.find(s=>s.id==='overcharge')!.cooldown);
    });

    it('ticks down active and cooldown', () => {
        let game = createFreshGameState();
        game = tickSkills(game, 0);
        game = activateSkill(game, 'overcharge');

        const duration = SKILL_DEFS.find(s=>s.id==='overcharge')!.duration;
        game = tickSkills(game, 1000);

        expect(game.skills['overcharge'].activeRemaining).toBe(duration - 1000);
    });

    it('applies stats when active', () => {
        let game = createFreshGameState();
        game = tickSkills(game, 0);

        const baseStats = deriveStats(game);

        game = activateSkill(game, 'overcharge'); // 2x click damage
        const activeStats = deriveStats(game);

        expect(activeStats.clickDamage).toBe(baseStats.clickDamage * 2);
    });
});
