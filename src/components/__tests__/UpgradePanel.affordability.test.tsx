import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UpgradePanel } from '../UpgradePanel';
import { createFreshGameState, costOf } from '../../logic';
import { UPGRADE_DEFS } from '../../config';

describe('UpgradePanel - Affordability', () => {
    const mockOnPurchase = vi.fn();
    const mockOnToggleAutoBuy = vi.fn();

    it('should disable upgrade button when stardust is insufficient', () => {
        const game = createFreshGameState();
        const def = UPGRADE_DEFS[0]; // First upgrade
        const cost = costOf(def, 0);
        
        game.stardust = cost - 1; // Just below cost

        render(
            <UpgradePanel 
                game={game} 
                onPurchase={mockOnPurchase} 
                onToggleAutoBuy={mockOnToggleAutoBuy} 
            />
        );

        const button = screen.getByText(def.name).closest('button');
        expect(button).toBeDisabled();

        fireEvent.click(button!);
        expect(mockOnPurchase).not.toHaveBeenCalled();
    });

    it('should enable upgrade button when stardust is exactly equal to cost', () => {
        const game = createFreshGameState();
        const def = UPGRADE_DEFS[0];
        const cost = costOf(def, 0);
        
        game.stardust = cost; // Exact cost

        render(
            <UpgradePanel 
                game={game} 
                onPurchase={mockOnPurchase} 
                onToggleAutoBuy={mockOnToggleAutoBuy} 
            />
        );

        const button = screen.getByText(def.name).closest('button');
        expect(button).not.toBeDisabled();

        fireEvent.click(button!);
        expect(mockOnPurchase).toHaveBeenCalledWith(def);
    });

    it('should enable upgrade button when stardust is greater than cost', () => {
        const game = createFreshGameState();
        const def = UPGRADE_DEFS[0];
        const cost = costOf(def, 0);
        
        game.stardust = cost + 100;

        render(
            <UpgradePanel 
                game={game} 
                onPurchase={mockOnPurchase} 
                onToggleAutoBuy={mockOnToggleAutoBuy} 
            />
        );

        const button = screen.getByText(def.name).closest('button');
        expect(button).not.toBeDisabled();
    });
});
