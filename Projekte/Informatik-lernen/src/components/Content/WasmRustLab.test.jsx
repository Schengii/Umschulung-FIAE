// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WasmRustLab from './WasmRustLab';

describe('WasmRustLab', () => {
  it('führt das echte Wasm-Modul aus und zeigt den i32-Überlauf', async () => {
    const onRewardXP = vi.fn();
    render(<WasmRustLab onRewardXP={onRewardXP} />);
    expect(screen.getByText(/Gültiges Modul, Binärformat-Version 1/)).toBeTruthy();

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /add\(a, b\)/ }));
      expect(screen.getByText(/add\(2147483647, 1\) = -2147483648/)).toBeTruthy();
    });
    expect(screen.getByText(/Überlauf: i32 rechnet modulo/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /memory\.grow\(1\)/ }));
    expect(screen.getByText(/2 Seiten = 131\.072 Byte/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^code/ }));
    fireEvent.click(screen.getByRole('button', { name: /Byte 1 beschädigen/ }));
    expect(screen.getByText(/Ungültig: Magic Number falsch an Byte 1/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /50 XP abholen/ }));
    expect(onRewardXP).toHaveBeenCalledWith(50);
  });
});
