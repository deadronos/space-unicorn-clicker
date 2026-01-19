
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { AchievementGallery } from '../AchievementGallery';
import { createFreshGameState } from '../../logic';

describe('AchievementGallery Crash Reproduction', () => {
    it('should open AchievementGallery without crashing when Legacy button is clicked', async () => {
        render(<App />);
        
        const legacyButton = screen.getByText(/Legacy/i);
        fireEvent.click(legacyButton);

        // Expect the dialog title to appear
        expect(await screen.findByText("Galactic Legacy")).toBeInTheDocument();
    });

    it('should render AchievementGallery component in isolation', () => {
        const game = createFreshGameState();
        render(<AchievementGallery game={game} onClose={() => {}} />);
        expect(screen.getByText("Galactic Legacy")).toBeInTheDocument();
    });
});
