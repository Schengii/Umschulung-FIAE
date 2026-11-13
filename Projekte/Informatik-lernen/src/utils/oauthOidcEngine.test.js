import { describe, it, expect } from 'vitest';
import {
  validateAuthRequest,
  base64UrlDecode,
  parseAndValidateJwt,
  simulateTokenRotation,
  OAUTH_OIDC_DRILL_QUESTIONS
} from './oauthOidcEngine';

describe('oauthOidcEngine', () => {
  describe('validateAuthRequest', () => {
    it('akzeptiert einen vollständigen Authorization Code Flow mit PKCE & OIDC', () => {
      const res = validateAuthRequest({
        response_type: 'code',
        client_id: 'spa-client-1',
        redirect_uri: 'https://app.devgame.de/callback',
        scope: 'openid profile email',
        state: 'xyz_random_csrf_token_123',
        code_challenge: 'E9Melhoa2OwvFrGMTJguCH5rtx64ZnJSm91G3e3b50A',
        code_challenge_method: 'S256'
      });
      expect(res.isValid).toBe(true);
      expect(res.isOidc).toBe(true);
      expect(res.hardErrors.length).toBe(0);
    });

    it('warnt vor veraltetem Implicit Flow und fehlendem PKCE', () => {
      const res = validateAuthRequest({
        response_type: 'token',
        client_id: 'client-1',
        redirect_uri: 'https://app.example.com',
        scope: 'profile'
      });
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes('Implicit Flow'))).toBe(true);
      expect(res.issues.some((i) => i.includes('code_challenge'))).toBe(true);
      expect(res.isOidc).toBe(false);
    });
  });

  describe('base64UrlDecode & parseAndValidateJwt', () => {
    it('dekodiert Base64URL Zeichen korrekt', () => {
      const encoded = 'eyJhYmMiOiJkZWYifQ'; // {"abc":"def"}
      expect(base64UrlDecode(encoded)).toBe('{"abc":"def"}');
    });

    it('wirft Fehler bei ungültigem Base64', () => {
      expect(() => base64UrlDecode('???notbase64???')).toThrow();
    });

    it('zerlegt und validiert JWT Token', () => {
      const headerB64 = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const payloadB64 = btoa(JSON.stringify({
        sub: 'user_42',
        iss: 'https://auth.example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const dummySig = 'test_signature_bytes';
      const jwt = `${headerB64}.${payloadB64}.${dummySig}`;

      const res = parseAndValidateJwt(jwt);
      expect(res.isValid).toBe(true);
      expect(res.header.alg).toBe('RS256');
      expect(res.payload.sub).toBe('user_42');
      expect(res.isExpired).toBe(false);
    });

    it('erkennt abgelaufene Tokens', () => {
      const headerB64 = btoa(JSON.stringify({ alg: 'HS256' }));
      const payloadB64 = btoa(JSON.stringify({
        sub: 'expired_user',
        exp: Math.floor(Date.now() / 1000) - 60
      }));
      const jwt = `${headerB64}.${payloadB64}.sig`;

      const res = parseAndValidateJwt(jwt);
      expect(res.isValid).toBe(true);
      expect(res.isExpired).toBe(true);
    });

    it('lehnt unvollständige Tokens mit ungültigem Format ab', () => {
      const res = parseAndValidateJwt('nur.zwei.teile.oder.vier.teile.hier');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('simulateTokenRotation', () => {
    it('gibt neues Token-Paar bei gültigem Refresh Token aus', () => {
      const currentRt = 'rt_initial_valid_123';
      const res = simulateTokenRotation(currentRt, currentRt);
      expect(res.success).toBe(true);
      expect(res.tokens.access_token).toBeDefined();
      expect(res.tokens.refresh_token).toBeDefined();
      expect(res.tokens.refresh_token).not.toBe(currentRt);
    });

    it('blockiert Replay-Versuche mit altem Refresh Token', () => {
      const res = simulateTokenRotation('rt_old_stolen_token', 'rt_new_active_token');
      expect(res.success).toBe(false);
      expect(res.error).toContain('invalid_grant');
    });
  });

  describe('OAUTH_OIDC_DRILL_QUESTIONS', () => {
    it('liefert 4 fundierte Fragen', () => {
      expect(OAUTH_OIDC_DRILL_QUESTIONS.length).toBe(4);
      OAUTH_OIDC_DRILL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(typeof q.correct).toBe('number');
        expect(q.explanation).toBeDefined();
      });
    });
  });
});

