/**
 * Git 3-Way Merge Conflict Engine
 * Models file versions, conflict marker parsing, and resolutions.
 */

export const GIT_CONFLICT_SCENARIOS = [
  {
    id: 'config_port',
    fileName: 'server.config.json',
    branchCurrent: 'main',
    branchIncoming: 'feature/microservice-ports',
    description: 'Beide Branches haben den Port und das Log-Level in der Server-Konfiguration gleichzeitig geändert.',
    baseCode: `{\n  "appName": "IT-Auth-Service",\n  "port": 8080,\n  "logLevel": "INFO",\n  "database": "postgres://localhost:5432/auth"\n}`,
    currentCode: `{\n  "appName": "IT-Auth-Service",\n  "port": 3000,\n  "logLevel": "WARN",\n  "database": "postgres://localhost:5432/auth"\n}`,
    incomingCode: `{\n  "appName": "IT-Auth-Service",\n  "port": 8443,\n  "logLevel": "DEBUG",\n  "database": "postgres://localhost:5432/auth",\n  "tls": true\n}`,
    targetAcceptedBoth: `{\n  "appName": "IT-Auth-Service",\n  "port": 8443,\n  "logLevel": "INFO",\n  "database": "postgres://localhost:5432/auth",\n  "tls": true\n}`
  },
  {
    id: 'auth_middleware',
    fileName: 'authMiddleware.js',
    branchCurrent: 'main',
    branchIncoming: 'security/jwt-rotation',
    description: 'Im Feature-Branch wurde eine asymmetrische RS256-Prüfung eingebaut, während auf main ein Bearer-Token-Prefix hinzugefügt wurde.',
    baseCode: `export function verifyToken(req, res, next) {\n  const token = req.headers['authorization'];\n  if (!token) return res.status(401).send('Unauthorized');\n  return next();\n}`,
    currentCode: `export function verifyToken(req, res, next) {\n  const authHeader = req.headers['authorization'];\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Invalid Bearer format' });\n  }\n  const token = authHeader.split(' ')[1];\n  return next();\n}`,
    incomingCode: `export function verifyToken(req, res, next) {\n  const token = req.headers['authorization'];\n  if (!token) return res.status(401).send('Unauthorized');\n  const isRs256Valid = verifyJwtSignatureRS256(token);\n  if (!isRs256Valid) return res.status(403).send('Forbidden');\n  return next();\n}`,
    targetAcceptedBoth: `export function verifyToken(req, res, next) {\n  const authHeader = req.headers['authorization'];\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Invalid Bearer format' });\n  }\n  const token = authHeader.split(' ')[1];\n  const isRs256Valid = verifyJwtSignatureRS256(token);\n  if (!isRs256Valid) return res.status(403).json({ error: 'Forbidden' });\n  return next();\n}`
  }
];

export function generateConflictMarkers(currentText, incomingText, currentBranch = 'HEAD', incomingBranch = 'incoming') {
  return `<<<<<<< ${currentBranch} (Aktuelle Änderung)\n${currentText.trim()}\n=======\n${incomingText.trim()}\n>>>>>>> ${incomingBranch} (Eingehende Änderung)`;
}

export function hasConflictMarkers(text) {
  if (!text) return false;
  return text.includes('<<<<<<<') || text.includes('=======') || text.includes('>>>>>>>');
}

export function resolveConflictAction(action, currentText, incomingText) {
  switch (action) {
    case 'accept_current':
      return currentText.trim();
    case 'accept_incoming':
      return incomingText.trim();
    case 'accept_both':
      return `${currentText.trim()}\n\n// --- Eingehende Ergänzung ---\n${incomingText.trim()}`;
    default:
      return currentText.trim();
  }
}
