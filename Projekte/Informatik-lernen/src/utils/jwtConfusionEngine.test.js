import { describe, it, expect } from 'vitest';
import { 
  createSampleRs256Token, 
  verifyJwtToken, 
  forgeAlgorithmConfusionToken, 
  forgeNoneAlgToken,
  base64UrlEncode,
  base64UrlDecode
} from './jwtConfusionEngine';

describe('jwtConfusionEngine', () => {
  it('encodes and decodes base64url correctly', () => {
    const original = 'Hello World & IT-Security! + / =';
    const encoded = base64UrlEncode(original);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
    expect(base64UrlDecode(encoded)).toBe(original);
  });

  it('creates and verifies legitimate RS256 token', () => {
    const { token, payload } = createSampleRs256Token();
    const result = verifyJwtToken(token, {
      vulnerableToAlgConfusion: false,
      allowNoneAlg: false,
      serverConfiguredAlg: 'RS256'
    });

    expect(result.valid).toBe(true);
    expect(result.claims.sub).toBe(payload.sub);
    expect(result.claims.role).toBe('user');
    expect(result.vulnerabilityTriggered).toBeNull();
  });

  it('rejects tampered RS256 token payload', () => {
    const { token } = createSampleRs256Token();
    const parts = token.split('.');
    const tamperedPayload = base64UrlEncode(JSON.stringify({ sub: 'user_1024', role: 'admin' }));
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const result = verifyJwtToken(tamperedToken);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Signatur ungültig');
  });

  it('prevents algorithm confusion by default on secured server', () => {
    const { token } = createSampleRs256Token();
    const exploitToken = forgeAlgorithmConfusionToken(token, 'root');

    const result = verifyJwtToken(exploitToken, {
      vulnerableToAlgConfusion: false,
      serverConfiguredAlg: 'RS256'
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Algorithmus-Mismatch');
  });

  it('demonstrates vulnerability when server is vulnerable to algorithm confusion', () => {
    const { token } = createSampleRs256Token();
    const exploitToken = forgeAlgorithmConfusionToken(token, 'root');

    const result = verifyJwtToken(exploitToken, {
      vulnerableToAlgConfusion: true,
      serverConfiguredAlg: 'RS256'
    });

    expect(result.valid).toBe(true);
    expect(result.claims.role).toBe('root');
    expect(result.vulnerabilityTriggered).toBe('ALGORITHM_CONFUSION_EXPLOIT');
  });

  it('demonstrates none algorithm attack prevention vs exploit', () => {
    const { token } = createSampleRs256Token();
    const noneToken = forgeNoneAlgToken(token, 'admin');

    // Secured server rejects
    const secureResult = verifyJwtToken(noneToken, { allowNoneAlg: false });
    expect(secureResult.valid).toBe(false);
    expect(secureResult.error).toContain('"none"');

    // Vulnerable server allows
    const vulnResult = verifyJwtToken(noneToken, { allowNoneAlg: true });
    expect(vulnResult.valid).toBe(true);
    expect(vulnResult.claims.role).toBe('admin');
    expect(vulnResult.vulnerabilityTriggered).toBe('NONE_ALGORITHM_EXPLOIT');
  });
});
