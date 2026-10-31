// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SubnettingLab from './SubnettingLab';

afterEach(() => cleanup());

describe('SubnettingLab Unit Tests', () => {
  it('berechnet standardmäßig das Subnetz für 192.168.1.100/24', () => {
    render(<SubnettingLab onRewardXP={() => {}} />);
    expect(screen.getByText('192.168.1.0')).toBeTruthy();
    expect(screen.getByText('192.168.1.255')).toBeTruthy();
    expect(screen.getByText('254')).toBeTruthy();
  });

  it('aktualisiert Netzwerk-ID und Broadcast bei Eingabe einer neuen IP', () => {
    render(<SubnettingLab onRewardXP={() => {}} />);
    const ipInput = screen.getByDisplayValue('192.168.1.100');
    fireEvent.change(ipInput, { target: { value: '10.0.0.50' } });

    expect(screen.getByText('10.0.0.0')).toBeTruthy();
    expect(screen.getByText('10.0.0.255')).toBeTruthy();
  });

  it('wechselt zum Quiz-Modus und vergibt XP bei richtiger Antwort', () => {
    const onRewardXP = vi.fn();
    render(<SubnettingLab onRewardXP={onRewardXP} />);

    const quizTabBtn = screen.getByRole('button', { name: /ihk übungs-quiz/i });
    fireEvent.click(quizTabBtn);

    // Question 1 correct answer is 192.168.1.128
    const correctBtn = screen.getByRole('button', { name: '192.168.1.128' });
    fireEvent.click(correctBtn);

    expect(onRewardXP).toHaveBeenCalledWith(25);
    expect(screen.getByText(/nächste frage/i)).toBeTruthy();
  });
});
