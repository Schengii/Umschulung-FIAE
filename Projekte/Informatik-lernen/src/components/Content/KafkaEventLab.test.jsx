// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KafkaEventLab from './KafkaEventLab';

describe('KafkaEventLab', () => {
  it('schreibt Events, liest mit zwei Gruppen und vergibt XP nach allen Aufgaben', () => {
    const onRewardXP = vi.fn();
    render(<KafkaEventLab onRewardXP={onRewardXP} />);
    const claim = screen.getByRole('button', { name: /50 XP abholen/ });
    expect(claim.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /6 Events/ }));
    expect(screen.getByText(/Partitions-Logs \(6 Events\)/)).toBeTruthy();

    const polls = screen.getAllByRole('button', { name: /poll\(\)/ });
    fireEvent.click(polls[0]);
    fireEvent.click(polls[1]);
    expect(screen.getByText(/Zuletzt geliefert \(analytics\)/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Consumer: 2/), { target: { value: '5' } });
    expect(screen.getAllByText(/keine Partition \(idle\)/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(claim.disabled).toBe(false);
    fireEvent.click(claim);
    expect(onRewardXP).toHaveBeenCalledWith(50);
    expect(screen.getByRole('button', { name: /50 XP erhalten/ }).disabled).toBe(true);
  });
});
