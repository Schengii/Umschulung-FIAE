// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import UsvCalculatorLab from './UsvCalculatorLab';

afterEach(() => cleanup());

describe('UsvCalculatorLab', () => {
  it('rendert ohne Absturz und zeigt Leistungsrechner an', () => {
    render(<UsvCalculatorLab />);
    expect(screen.getByText(/IHK USV-Dimensionierung & Stromversorgungs-Studio/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Autonomiezeit/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /USV-Typen & PUE/i })).toBeTruthy();
  });

  it('wechselt zum Autonomiezeit Tab und zeigt Minuten an', () => {
    render(<UsvCalculatorLab />);
    const autoTabBtn = screen.getByRole('button', { name: /Autonomiezeit/i });
    fireEvent.click(autoTabBtn);

    expect(screen.getByText(/Autonomiezeit-Kalkulation/i)).toBeTruthy();
    expect(screen.getByText(/Errechnete Autonomiezeit/i)).toBeTruthy();
  });

  it('wechselt zu Topologien und PUE', () => {
    render(<UsvCalculatorLab />);
    const topTabBtn = screen.getByRole('button', { name: /USV-Typen & PUE/i });
    fireEvent.click(topTabBtn);

    expect(screen.getByText(/USV-Topologien nach DIN EN 62040-3/i)).toBeTruthy();
    expect(screen.getByText(/PUE-Rechner/i)).toBeTruthy();
  });
});
