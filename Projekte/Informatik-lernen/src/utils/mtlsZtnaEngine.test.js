import { describe, it, expect } from 'vitest';
import {
  MTLS_MESH_CONFIG,
  validateMtlsHandshake
} from './mtlsZtnaEngine';

describe('mtlsZtnaEngine', () => {
  it('successfully authorizes valid service on permitted endpoint', () => {
    const cert = MTLS_MESH_CONFIG.services['order-service'];
    const res = validateMtlsHandshake(cert, 'POST /orders');

    expect(res.handshakeSuccess).toBe(true);
    expect(res.httpStatus).toBe(200);
    expect(res.errorMessage).toBeNull();
    expect(res.sessionCipher).toContain('TLS_AES_256');
  });

  it('rejects revoked certificate during TLS handshake with HTTP 496', () => {
    const cert = MTLS_MESH_CONFIG.services['compromised-service'];
    const res = validateMtlsHandshake(cert, 'POST /orders');

    expect(res.handshakeSuccess).toBe(false);
    expect(res.httpStatus).toBe(496);
    expect(res.errorMessage).toContain('Revoked');
  });

  it('allows TLS handshake but denies access (HTTP 403) when endpoint is unauthorized', () => {
    const cert = MTLS_MESH_CONFIG.services['order-service'];
    // order-service darf nicht /charges aufrufen (nur payment-service)
    const res = validateMtlsHandshake(cert, 'POST /charges');

    expect(res.handshakeSuccess).toBe(true);
    expect(res.httpStatus).toBe(403);
    expect(res.errorMessage).toContain('Forbidden');
  });
});
