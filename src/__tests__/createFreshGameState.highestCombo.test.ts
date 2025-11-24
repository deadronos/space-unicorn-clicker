import { describe, it, expect } from 'vitest';
import { createFreshGameState } from '../logic';

describe('createFreshGameState - stats.highestCombo', () => {
    it('should initialize stats.highestCombo to 0', () => {
        const state = createFreshGameState();
        // Use bracket access to avoid TypeScript errors until types are updated
        expect((state as any).stats['highestCombo']).toBe(0);
    });
});
