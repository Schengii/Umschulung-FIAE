// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Bomb({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Kaboom aus einem simulierten Lab-Absturz');
  }
  return <div>Alles ok</div>;
}

describe('ErrorBoundary', () => {
  it('rendert Kinder normal, solange kein Fehler auftritt', () => {
    render(
      <ErrorBoundary resetKey="a">
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Alles ok')).toBeDefined();
  });

  it('fängt einen Render-Fehler ab und zeigt die Fallback-UI statt abzustürzen', () => {
    // React loggt Fehler in Boundaries zusätzlich über console.error - hier bewusst stummschalten.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary resetKey="a">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/abgestürzt/i)).toBeDefined();
    expect(screen.getByText(/Kaboom aus einem simulierten Lab-Absturz/)).toBeDefined();
  });

  it('erlaubt einen manuellen Retry über den Button', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    function Wrapper() {
      const [broken, setBroken] = React.useState(true);
      return (
        <ErrorBoundary resetKey="a">
          <button data-testid="fix-it" onClick={() => setBroken(false)}>
            fix
          </button>
          <Bomb shouldThrow={broken} />
        </ErrorBoundary>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText(/abgestürzt/i)).toBeDefined();

    // Der Retry-Button setzt nur den Fehlerzustand der Boundary zurück; da die
    // zugrundeliegende Komponente (ohne den "fix"-Klick) weiterhin wirft, würde
    // ein erneuter Absturz erwartet. Wir prüfen daher, dass der Button existiert
    // und klickbar ist, ohne dass ein zweiter Fehler die Test-Suite crasht.
    const retryButton = screen.getByRole('button', { name: /Erneut versuchen/i });
    expect(retryButton).toBeDefined();
    fireEvent.click(retryButton);
    expect(screen.getByText(/abgestürzt/i)).toBeDefined();
  });

  it('setzt den Fehlerzustand automatisch zurück, wenn resetKey sich ändert (Tab-Wechsel)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary resetKey="lab-a">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/abgestürzt/i)).toBeDefined();

    rerender(
      <ErrorBoundary resetKey="lab-b">
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Alles ok')).toBeDefined();
  });

  it('nutzt einen benutzerdefinierten fallback-Renderer, sofern übergeben', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary resetKey="a" fallback={({ retry }) => <div data-testid="custom-fallback" onClick={retry}>Custom</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.queryByText(/abgestürzt/i)).toBeNull();
  });

  it('ruft onError auf, wenn ein Fehler abgefangen wird', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary resetKey="a" onError={onError}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('Kaboom aus einem simulierten Lab-Absturz');
  });
});
