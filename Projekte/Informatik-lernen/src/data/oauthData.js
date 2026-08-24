export const OAUTH_STEPS = [
  {
    id: 'pkce_flow',
    title: '1. Authorization Code Flow mit PKCE',
    desc: 'Der sicherste Authentifizierungs-Standard für Single-Page Applications (SPAs) und Mobile Apps ohne Client Secret.',
    codeSnippet: `// 1. Code Verifier & Challenge (S256) generieren
const codeVerifier = generateRandomString(128);
const codeChallenge = base64UrlEncode(sha256(codeVerifier));

// 2. User zur Authorize URL weiterleiten
const authUrl = \`https://auth.devgame.it/oauth/authorize?
  response_type=code&
  client_id=my_spa_app&
  redirect_uri=https://devgame.it/callback&
  code_challenge=\${codeChallenge}&
  code_challenge_method=S256&
  scope=openid profile email\`;`
  },
  {
    id: 'jwt_decoder',
    title: '2. JWT Token Struktur (Header, Payload, Signature)',
    desc: 'JSON Web Tokens bestehen aus drei mit Punkten getrennten Base64URL-Teilen: Header, Claims (Payload) und Cryptographic Signature.',
    codeSnippet: `// JWT Token Beispiel: header.payload.signature
const sampleJWT = {
  header: { "alg": "RS256", "typ": "JWT" },
  payload: {
    "sub": "usr_99812",
    "name": "Alex Dev",
    "role": "Senior Engineer",
    "iat": 1770899000,
    "exp": 1770902600
  },
  signature: "RS256_RSA_Signature_Hash..."
};`
  }
];
