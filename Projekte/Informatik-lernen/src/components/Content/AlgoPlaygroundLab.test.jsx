// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import AlgoPlaygroundLab from './AlgoPlaygroundLab';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('AlgoPlaygroundLab Unit Tests', () => {
  it('rendert den Algorithmen-Visualisierer mit Initial-Array', () => {
    render(<AlgoPlaygroundLab onRewardXP={() => {}} />);
    expect(screen.getByText(/Interaktiver Algorithmen- & Step-Visualisierer/i)).toBeTruthy();
    expect(screen.getByText(/Start Animation/i)).toBeTruthy();
    expect(screen.getByText(/Zufalls-Array/i)).toBeTruthy();
  });

  it('wechselt den aktiven Algorithmus und aktualisiert die Beschreibung', () => {
    render(<AlgoPlaygroundLab onRewardXP={() => {}} />);
    const algoButtons = screen.getAllByRole('button');
    // Find button for an algorithm other than current active
    const bubblesortBtn = algoButtons.find(b => /bubblesort/i.test(b.textContent || ''));
    if (bubblesortBtn) {
      fireEvent.click(bubblesortBtn);
      expect(screen.getByText(/Bubblesort/i)).toBeTruthy();
    }
  });

  it('führt Sortier-Animation aus und vergibt XP bei Fertigstellung', async () => {
    vi.useFakeTimers();
    const onRewardXP = vi.fn();
    render(<AlgoPlaygroundLab onRewardXP={onRewardXP} />);

    const startBtn = screen.getByRole('button', { name: /start animation/i });
    fireEvent.click(startBtn);

    // Fast-forward fake timers through the animation loop
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });

    expect(onRewardXP).toHaveBeenCalledWith(35);
  });
});

