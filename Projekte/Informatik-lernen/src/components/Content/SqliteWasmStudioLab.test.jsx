// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import SqliteWasmStudioLab from './SqliteWasmStudioLab';

afterEach(() => cleanup());

describe('SqliteWasmStudioLab Interaktion', () => {
  it('wechselt die Beispiel-Datenbank ohne Absturz (Regression: setSandbox war nicht definiert)', async () => {
    render(<SqliteWasmStudioLab />);
    await waitFor(() => expect(screen.getAllByText(/Felix Becker/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: 'Server DB' }));
    await waitFor(() => expect(screen.getAllByText(/srv-prod-db01/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: 'Shop DB' }));
    await waitFor(() => expect(screen.getAllByText(/Max Mustermann/).length).toBeGreaterThan(0));
  });
});
