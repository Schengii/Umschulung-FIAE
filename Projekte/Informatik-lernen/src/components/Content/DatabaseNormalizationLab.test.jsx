// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import DatabaseNormalizationLab from './DatabaseNormalizationLab';

afterEach(() => cleanup());

describe('DatabaseNormalizationLab', () => {
  it('rendert ohne Absturz und zeigt Normalisierungs-Stufen an', () => {
    render(<DatabaseNormalizationLab />);
    expect(screen.getByText(/Relationales Datenbank-Normalisierungs-Studio/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Anomalien-Simulator/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /IHK-Drill/i })).toBeTruthy();
  });

  it('wechselt zwischen Stufen 1NF, 2NF und 3NF', () => {
    render(<DatabaseNormalizationLab />);
    const stage3Btn = screen.getByRole('button', { name: /3\. Normalform/i });
    fireEvent.click(stage3Btn);
    expect(screen.getByText(/Optimale 3\. Normalform erreicht/i)).toBeTruthy();
  });

  it('wechselt zum Anomalien-Simulator', () => {
    render(<DatabaseNormalizationLab />);
    const anomTabBtn = screen.getByRole('button', { name: /Anomalien-Simulator/i });
    fireEvent.click(anomTabBtn);
    expect(screen.getByText(/Die 3 klassischen Datenbank-Anomalien/i)).toBeTruthy();
  });
});
