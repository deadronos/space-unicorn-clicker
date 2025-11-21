
import { render, fireEvent, screen, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock Math.random to control critical hits and unicorn spawns
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    vi.useFakeTimers();
  });

  test('unicorns from crits should not disappear', async () => {
    render(<App />);

    const attackButton = screen.getByTitle('Click to fire your horn laser!');

    // The initial state should be 1 unicorn, so no squadron text.
    // Actually, the text is always visible now: "🦄 Unicorns: 1"
    let unicornDisplay = screen.getByText(/🦄 Unicorns:/);
    expect(unicornDisplay).toBeInTheDocument();
    expect(unicornDisplay.textContent).toContain('🦄 Unicorns: 1');

    // First click, which is a crit that spawns a unicorn.
    fireEvent.click(attackButton);

    // We should now have 2 unicorns.
    unicornDisplay = screen.getByText(/🦄 Unicorns:/);
    expect(unicornDisplay).toBeInTheDocument();
    expect(unicornDisplay.textContent).toContain('🦄 Unicorns: 2');

    // Wait for the next game tick.
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The unicorn display should still show 2 unicorns.
    unicornDisplay = screen.getByText(/🦄 Unicorns:/);
    expect(unicornDisplay).toBeInTheDocument();
    expect(unicornDisplay.textContent).toContain('🦄 Unicorns: 2');
  });
});
