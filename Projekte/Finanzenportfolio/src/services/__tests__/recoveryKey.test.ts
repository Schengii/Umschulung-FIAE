// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRecoveryKey,
  normalizeRecoveryKey,
  createRecoveryKey,
  recoverPinWithKey,
  hasRecoveryKey,
  removeRecoveryKey
} from '../recoveryKey';

describe('recoveryKey', () => {
  beforeEach(() => localStorage.clear());

  it('erzeugt 32 Base32-Zeichen in 8 Vierergruppen', () => {
    const key = generateRecoveryKey();
    expect(key).toMatch(/^([A-Z2-7]{4}-){7}[A-Z2-7]{4}$/);
    expect(generateRecoveryKey()).not.toBe(key);
  });

  it('normalisiert Schreibweise, Bindestriche und Leerzeichen', () => {
    expect(normalizeRecoveryKey('abcd-efgh 2345')).toBe('ABCDEFGH2345');
  });

  it('stellt die PIN mit dem richtigen Key wieder her (auch in anderer Schreibweise)', async () => {
    const key = await createRecoveryKey('meine-pin-1234');
    expect(hasRecoveryKey()).toBe(true);
    expect(localStorage.getItem('finanz_recovery_wrapped')).not.toContain('meine-pin');
    expect(await recoverPinWithKey(key)).toBe('meine-pin-1234');
    expect(await recoverPinWithKey(key.toLowerCase().replace(/-/g, ' '))).toBe('meine-pin-1234');
  }, 20000);

  it('falscher Key oder fehlende Einrichtung wird abgelehnt', async () => {
    await expect(recoverPinWithKey('AAAA-AAAA')).rejects.toBeDefined();
    await createRecoveryKey('pin');
    await expect(recoverPinWithKey('AAAA-BBBB-CCCC-DDDD-EEEE-FFFF-GGGG-HHHH')).rejects.toBeDefined();
  }, 20000);

  it('Entfernen löscht den Eintrag', async () => {
    await createRecoveryKey('pin');
    removeRecoveryKey();
    expect(hasRecoveryKey()).toBe(false);
  }, 20000);
});
