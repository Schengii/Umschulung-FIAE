import { Activity, Globe, Key, KeyRound, Lock, Shield, Zap } from 'lucide-react';

export const securityModules = [
  {
    id: 'dnssec_rollover_lab',
    title: 'DNSSEC KSK & ZSK Key Rollover & Chain-of-Trust Simulator',
    category: 'security',
    tags: ['#DNSSEC', '#KSK', '#ZSK', '#KeyRollover', '#DS', '#RRSIG', '#DNSKEY', '#RFC4034', '#RFC5011'],
    difficulty: 'Advanced',
    desc: 'Simuliere ZSK Pre-Publish und KSK Double-DS Rollover Schritt für Schritt: TTL-Caches, Parent-Zone DS-Publikation und lückenlose Validierung der Vertrauenskette.',
    icon: KeyRound,
    badge: 'Neu',
    color: '#8b5cf6'
  },
  {
    id: 'cloud_iam_policy_lab',
    title: 'Cloud IAM Policy Evaluator & Least-Privilege Linter',
    category: 'security',
    tags: ['#IAM', '#AWS', '#CloudSecurity', '#LeastPrivilege', '#SCP', '#ExplicitDeny', '#Policies', '#ZeroTrust'],
    difficulty: 'Advanced',
    desc: 'Auswertung von Organization SCPs, Identity- und Resource-Policies mit striktem Explicit Deny Vorrang sowie automatischem Linter für überprivilegierte Administrator-Rechte.',
    icon: Lock,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'linux_auditd_ebpf_lab',
    title: 'Linux Auditd & eBPF Syscall Tracepoint Security Studio',
    category: 'security',
    tags: ['#Linux', '#Auditd', '#eBPF', '#Syscalls', '#execve', '#ThreatHunting', '#SELinux', '#Hardening'],
    difficulty: 'Advanced',
    desc: 'Kernel-Level Threat Hunting: Erkennung von RCE-Reverse-Shells, Privilege Escalation und Passwort-Tampering via Auditd-Regeln und eBPF Syscall-Filtern.',
    icon: Activity,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'oauth21_dpop_lab',
    title: 'OAuth 2.1 & RFC 9449 DPoP Sender-Constrained Security Studio',
    category: 'security',
    tags: ['#OAuth21', '#DPoP', '#RFC9449', '#PKCE', '#Security', '#ZeroTrust', '#TokenBinding', '#ReplayDefense'],
    difficulty: 'Advanced',
    desc: 'Modernste Token-Sicherheit: Wegfall unsicherer Legacy-Flows (Implicit, Password), strikter PKCE-Zwang (S256) und kryptographische Tokenbindung mit Replay-Schutz.',
    icon: KeyRound,
    badge: 'Neu',
    color: '#06b6d4'
  },
  {
    id: 'mtls_ztna_lab',
    title: 'Mutual TLS (mTLS) & Zero-Trust Service-Mesh Studio',
    category: 'security',
    tags: ['#mTLS', '#ZeroTrust', '#RFC8446', '#TLS13', '#ClientCert', '#RBAC', '#ServiceMesh', '#Microservices'],
    difficulty: 'Advanced',
    desc: 'Gegenseitige Zertifikatsprüfung auf Transportschicht, CRL-Zertifikatssperren und feingranulare Zero-Trust RBAC-Zugriffskontrolle im Microservice-Mesh.',
    icon: Lock,
    badge: 'Neu',
    color: '#06b6d4'
  },
  {
    id: 'srp_zero_knowledge_lab',
    title: 'SRP-6a Zero-Knowledge Authentication Studio (RFC 5054)',
    category: 'security',
    tags: ['#SRP', '#ZeroKnowledge', '#RFC5054', '#Authentication', '#DiffieHellman', '#Verifier', '#Salt'],
    difficulty: 'Advanced',
    desc: 'Kryptographische Authentifizierung ohne Passwortübertragung: Ephemere Schlüssel (a/b), Public Keys (A/B), Password Verifier (v) und beidseitiger Schlüsseltausch (S).',
    icon: Lock,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'pki_certificate_lab',
    title: 'X.509 PKI & Certificate Chain Validator Studio',
    category: 'security',
    tags: ['#PKI', '#X509', '#TLS', '#Certificates', '#TrustAnchor', '#SAN', '#OCSP', '#RFC5280'],
    difficulty: 'Advanced',
    desc: 'Kryptographische Vertrauensketten (Root CA -> Intermediate -> Leaf), Hostname-Matching (SAN), Gültigkeitszeiträume und OCSP/CRL Revocation-Prüfung.',
    icon: Lock,
    badge: 'Neu',
    color: '#06b6d4'
  },
  {
    id: 'jwt_confusion_lab',
    title: 'JWT Algorithm Confusion & Security Studio',
    category: 'security',
    tags: ['#JWT', '#Security', '#AlgConfusion', '#RS256', '#HS256', '#NoneAlg', '#RFC7519', '#PrivilegeEscalation'],
    difficulty: 'Advanced',
    desc: 'RFC 7519 / 7518: Asymmetrische RS256 vs. symmetrische HS256 Key-Confusion, None-Algorithmus Exploit (CVE-2015-9235) und Signature Verification Defense.',
    icon: Key,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'oauth_revocation_lab',
    title: 'OAuth 2.0 Token Revocation & Introspection Studio',
    category: 'security',
    tags: ['#OAuth2', '#RFC7009', '#RFC7662', '#TokenRevocation', '#Introspection', '#APIGateway'],
    difficulty: 'Advanced',
    desc: 'RFC 7009 Token Revocation & RFC 7662 Introspection am API Gateway mit Kaskadierungslogik.',
    icon: Lock,
    badge: 'Security Neu',
    color: '#f59e0b'
  },
  {
    id: 'webauthn_passkey_lab',
    title: 'FIDO2 WebAuthn & Passkey Studio',
    category: 'security',
    tags: ['#WebAuthn', '#FIDO2', '#Passkeys', '#PublicPrivateKey', '#PhishingResistant'],
    difficulty: 'Advanced',
    desc: 'Passwortlose Anmeldung via Hardware-Tokens & Biometrie mit interaktivem Phishing-Schutz-Beweis.',
    icon: Key,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'tls_replay_lab',
    title: 'TLS 1.3 0-RTT Replay Attack Studio',
    category: 'security',
    tags: ['#TLS13', '#0RTT', '#ReplayAttack', '#RFC8446', '#EarlyData', '#StrikeRegister'],
    difficulty: 'Advanced',
    desc: 'RFC 8446 Early Data Sicherheit, Replay-Angriffe auf Zahlungen und Single-Use Ticket Abwehr.',
    icon: Lock,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'dnssec_validation_lab',
    title: 'DNSSEC Chain of Trust & RRSIG Studio',
    category: 'security',
    tags: ['#DNSSEC', '#RRSIG', '#NSEC3', '#Kaminsky', '#ChainOfTrust', '#RFC4035'],
    difficulty: 'Advanced',
    desc: 'Hierarchische Validierung vom Root-Anker über TLDs, NSEC3 Denial-of-Existence und Kaminsky-Abwehr.',
    icon: Globe,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'owasp_exploit_lab',
    title: 'OWASP Top 10 Live-Exploit Sandbox',
    category: 'security',
    tags: ['#OWASP', '#XSS', '#SQLi', '#CSRF', '#IDOR', '#Security'],
    difficulty: 'Advanced',
    desc: 'Interaktive Sicherheitslücken-Analyse & wirksame Gegenmaßnahmen im Code.',
    icon: Shield,
    badge: 'Neu',
    color: '#f43f5e'
  },
  {
    id: 'jwks_rotation_lab',
    title: 'OAuth2 JWKS & Key Rotation Studio',
    category: 'security',
    tags: ['#OAuth2', '#JWKS', '#RS256', '#KeyRotation', '#Security'],
    difficulty: 'Advanced',
    desc: 'Asymmetrische Token-Signierung & Zero-Downtime Key Rotation.',
    icon: Shield,
    badge: 'Neu',
    color: '#a855f7'
  },
  {
    id: 'crypto_keygen_lab',
    title: 'RSA & Diffie-Hellman Crypto Lab',
    category: 'security',
    tags: ['#Kryptographie', '#RSA', '#PublicKey', '#Modulo', '#DiffieHellman'],
    difficulty: 'Advanced',
    desc: 'Mathematische RSA Primzahl-Schlüsselpaar-Generierung und Chiffrierung.',
    icon: Shield,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'clean_code_lab',
    title: 'Clean Code & Security Review Arena',
    category: 'security',
    tags: ['#OWASP', '#CleanCode', '#MemoryLeaks', '#SQLi', '#Refactoring'],
    difficulty: 'Intermediate',
    desc: 'Finde kritische Sicherheitslücken, N+1 Queries & Memory Leaks im Code.',
    icon: Shield,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'pkce',
    title: 'OAuth2 PKCE & OIDC Identity Studio',
    category: 'security',
    tags: ['#Security', '#OAuth2', '#PKCE', '#JWT'],
    difficulty: 'Advanced',
    desc: 'Proof Key for Code Exchange Key-Generierung, Code-Austausch & JWT Decoding.',
    icon: Shield,
    color: '#ec4899'
  },
  {
    id: 'ctf_lab',
    title: 'Cybersecurity CTF Quest',
    category: 'security',
    tags: ['#Cybersecurity', '#Quest', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'XSS, SQL-Injection & Command Injection',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'oauth_oidc',
    title: 'OAuth2 & OpenID Connect',
    category: 'security',
    tags: ['#OAuth2', '#OpenID', '#Connect', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'Authorization Code Flow mit PKCE & JWT',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'zkp_crypto',
    title: 'ZKP & Kryptographie Visualizer',
    category: 'security',
    tags: ['#Kryptographie', '#Visualizer', '#SECURITY'],
    difficulty: 'Advanced',
    desc: 'Elliptische Kurven & Zero-Knowledge Proofs',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'oauth_token_exchange_lab',
    title: 'OAuth 2.0 Token Exchange Studio',
    category: 'security',
    tags: ['#OAuth', '#Token', '#Exchange', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'RFC 8693 Delegation, Actor Claim & JWT',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'wireguard_ztna_lab',
    title: 'WireGuard VPN & Zero-Trust ZTNA',
    category: 'security',
    tags: ['#WireGuard', '#Zero', '#Trust', '#ZTNA', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: '1-RTT NoiseIK & Cryptokey Routing',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'tls_handshake_lab',
    title: 'TLS 1.3 Handshake Studio',
    category: 'security',
    tags: ['#Handshake', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: '1-RTT Full Handshake & 0-RTT Session Resumption',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'jwt_attack_lab',
    title: 'JWT Sicherheitslücken Studio',
    category: 'security',
    tags: ['#Sicherheitslücken', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'alg:none Fälschung, Secret-Bruteforce & kid-Injection',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'cors_pitfalls_lab',
    title: 'CORS Fehlkonfigurationen Studio',
    category: 'security',
    tags: ['#CORS', '#Fehlkonfigurationen', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'Origin-Reflection, Regex-Bypass & Wildcard-Konflikt',
    icon: Zap,
    color: '#be123c'
  },
  {
    id: 'security_lab_v2',
    title: 'Red vs Blue Team Simulator',
    category: 'security',
    tags: ['#Blue', '#Team', '#SECURITY'],
    difficulty: 'Intermediate',
    desc: 'Angriffs- & Verteidigungsszenarien',
    icon: Zap,
    color: '#be123c'
  }
];
