// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TcpStateMachineLab from './TcpStateMachineLab';

afterEach(() => cleanup());

describe('TcpStateMachineLab Interaktion', () => {
  it('startet im CLOSED/LISTEN-Zustand', () => {
    render(<TcpStateMachineLab onRewardXP={() => {}} />);
    expect(screen.getAllByText('CLOSED').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LISTEN').length).toBeGreaterThan(0);
  });

  it('führt den 3-Way-Handshake aus: beide Seiten ESTABLISHED, XP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<TcpStateMachineLab onRewardXP={onRewardXP} />);
    const handshake = screen.getByRole('button', { name: /3-Way Handshake ausführen/i });
    fireEvent.click(handshake);
    expect(screen.getAllByText('ESTABLISHED').length).toBeGreaterThanOrEqual(2);
    fireEvent.click(handshake);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP.mock.calls[0][0]).toBe(55);
  });

  it('Teardown endet im TIME_WAIT beim Client', () => {
    render(<TcpStateMachineLab onRewardXP={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /4-Way Teardown ausführen/i }));
    expect(screen.getAllByText('TIME_WAIT').length).toBeGreaterThan(0);
  });

  it('Reset stellt den Ausgangszustand wieder her', () => {
    render(<TcpStateMachineLab onRewardXP={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /3-Way Handshake ausführen/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.queryAllByText('ESTABLISHED').length).toBe(0);
    expect(screen.getAllByText('LISTEN').length).toBeGreaterThan(0);
  });
});
