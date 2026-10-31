// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SqlWindowFunctionsLab from './SqlWindowFunctionsLab';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  });
});

afterEach(() => cleanup());

describe('SqlWindowFunctionsLab Unit Tests', () => {
  it('rendert SQL Studio Tabelle und Initialwerte', () => {
    render(<SqlWindowFunctionsLab onRewardXP={() => {}} />);
    expect(screen.getByText(/SQL Window Functions & Analytics Studio/i)).toBeTruthy();
    expect(screen.getByDisplayValue('department (Abteilung)')).toBeTruthy();
    expect(screen.getByDisplayValue('salary (Gehalt)')).toBeTruthy();
  });

  it('ändert Partitionierung und Sortierung', () => {
    render(<SqlWindowFunctionsLab onRewardXP={() => {}} />);
    const partitionSelect = screen.getByLabelText(/partition by/i);
    fireEvent.change(partitionSelect, { target: { value: 'none' } });

    expect(partitionSelect.value).toBe('none');

    const orderSelect = screen.getByLabelText(/order by/i);
    fireEvent.change(orderSelect, { target: { value: 'sales_volume' } });

    expect(orderSelect.value).toBe('sales_volume');
  });

  it('kopiert generierte SQL-Abfrage in die Zwischenablage und validiert das Lab (+65 XP)', () => {
    const onRewardXP = vi.fn();
    render(<SqlWindowFunctionsLab onRewardXP={onRewardXP} />);

    const copyBtn = screen.getByRole('button', { name: /sql kopieren/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const claimBtn = screen.getByRole('button', { name: /lab validieren/i });
    fireEvent.click(claimBtn);
    expect(onRewardXP).toHaveBeenCalledWith(65);
    expect(screen.getByText(/studio abgeschlossen/i)).toBeTruthy();
  });
});

