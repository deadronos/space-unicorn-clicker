import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeaderBar } from '../HeaderBar';
import { createFreshGameState } from '../../logic';

describe('HeaderBar - Combo Momentum Indicator', () => {
    it('shows momentum when derived.comboActive is true', () => {
        const game = createFreshGameState();
        const derived = createFreshGameState();
        (derived as any).comboActive = true;
        (derived as any).comboDpsMult = 1.5; // +50%
        derived.comboCount = 5;

        render(<HeaderBar game={game as any} derived={derived as any} onImport={() => {}} />);

        expect(screen.getByText(/Momentum/)).toBeTruthy();
        expect(screen.getByText(/50% DPS/)).toBeTruthy();
    });
});
