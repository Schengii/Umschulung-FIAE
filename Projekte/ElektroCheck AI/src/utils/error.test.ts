import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('liefert die Fehlermeldung einer Error-Instanz', () => {
    const error = new Error('Netzwerk-Timeout');
    expect(getErrorMessage(error)).toBe('Netzwerk-Timeout');
  });

  it('liefert den Text, wenn error ein String ist', () => {
    expect(getErrorMessage('Server nicht erreichbar')).toBe('Server nicht erreichbar');
  });

  it('liefert den Standard-Fallback bei leerem String oder sonstigen Werten', () => {
    expect(getErrorMessage('')).toBe('Unbekannter Fehler');
    expect(getErrorMessage(null)).toBe('Unbekannter Fehler');
    expect(getErrorMessage(undefined)).toBe('Unbekannter Fehler');
    expect(getErrorMessage({ code: 500 })).toBe('Unbekannter Fehler');
  });

  it('liefert den benutzerdefinierten Fallback', () => {
    expect(getErrorMessage(null, 'Eigener Fallback')).toBe('Eigener Fallback');
  });
});
