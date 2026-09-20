import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,st as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=[{id:`pkce_flow`,title:`1. Authorization Code Flow mit PKCE`,desc:`Der sicherste Authentifizierungs-Standard für Single-Page Applications (SPAs) und Mobile Apps ohne Client Secret.`,codeSnippet:`// 1. Code Verifier & Challenge (S256) generieren
const codeVerifier = generateRandomString(128);
const codeChallenge = base64UrlEncode(sha256(codeVerifier));

// 2. User zur Authorize URL weiterleiten
const authUrl = \`https://auth.devgame.it/oauth/authorize?
  response_type=code&
  client_id=my_spa_app&
  redirect_uri=https://devgame.it/callback&
  code_challenge=\${codeChallenge}&
  code_challenge_method=S256&
  scope=openid profile email\`;`},{id:`jwt_decoder`,title:`2. JWT Token Struktur (Header, Payload, Signature)`,desc:`JSON Web Tokens bestehen aus drei mit Punkten getrennten Base64URL-Teilen: Header, Claims (Payload) und Cryptographic Signature.`,codeSnippet:`// JWT Token Beispiel: header.payload.signature
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
};`}],s=n();function c(){let[e,t]=(0,a.useState)(o[0].id),[n,c]=(0,a.useState)(!1),l=o.find(t=>t.id===e)||o[0];return(0,s.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-indigo)`},children:[(0,s.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,s.jsx)(i,{size:32,style:{color:`var(--accent-indigo)`}}),` OAuth2 & OpenID Connect (OIDC) Security Playground`]}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Verstehe Authorization Code Flow mit PKCE, JWT Tokens (Header, Payload, Signature) & Access Tokens.`})]}),(0,s.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:o.map(n=>(0,s.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-indigo)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-indigo)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.title},n.id))}),(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,s.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:l.title}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`24px`},children:l.desc}),(0,s.jsxs)(`div`,{className:`code-window`,children:[(0,s.jsxs)(`div`,{className:`code-header`,children:[(0,s.jsx)(`span`,{children:`OAuth2 Code Snippet`}),(0,s.jsxs)(`button`,{onClick:()=>{navigator.clipboard.writeText(l.codeSnippet),c(!0),setTimeout(()=>c(!1),2e3)},style:{background:`transparent`,border:`none`,color:`#f8fafc`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`,fontSize:`0.85rem`},children:[(0,s.jsx)(r,{size:14}),` `,n?`Kopiert ✓`:`Kopieren`]})]}),(0,s.jsx)(`pre`,{className:`code-body`,children:(0,s.jsx)(`code`,{children:l.codeSnippet})})]})]})]})}export{c as default};