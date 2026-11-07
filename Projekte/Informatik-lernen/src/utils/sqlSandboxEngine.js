// @ts-check
import { runSql } from './sqlWorkerClient';

/**
 * SQL Sandbox Engine powered by AlaSQL
 * Provides in-memory SQL execution, Schema introspection and table seed data.
 */

/** @type {Record<string, string>} */
const INITIAL_SQL_SEEDS = {
  ecommerce: `
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name STRING,
  email STRING,
  city STRING,
  created_at STRING
);

INSERT INTO customers VALUES
  (1, 'Max Mustermann', 'max@beispiel.de', 'Berlin', '2026-01-15'),
  (2, 'Sarah Schmidt', 'sarah@web.de', 'Hamburg', '2026-02-20'),
  (3, 'Felix Becker', 'felix@tech.io', 'München', '2026-03-05'),
  (4, 'Anna Weber', 'anna@cloud.dev', 'Köln', '2026-04-12');

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date STRING,
  total_amount NUMERIC,
  status STRING
);

INSERT INTO orders VALUES
  (101, 1, '2026-05-01', 249.99, 'DELIVERED'),
  (102, 1, '2026-05-14', 89.50, 'SHIPPED'),
  (103, 2, '2026-05-18', 599.00, 'DELIVERED'),
  (104, 3, '2026-06-01', 120.00, 'PENDING');
`,
  it_assets: `
CREATE TABLE servers (
  id INT PRIMARY KEY,
  hostname STRING,
  ip_address STRING,
  os STRING,
  ram_gb INT,
  status STRING
);

INSERT INTO servers VALUES
  (1, 'srv-prod-db01', '10.10.5.11', 'Ubuntu 24.04 LTS', 64, 'ONLINE'),
  (2, 'srv-prod-api01', '10.10.5.21', 'Debian 12', 32, 'ONLINE'),
  (3, 'srv-stage-app01', '10.10.6.15', 'RHEL 9', 16, 'MAINTENANCE'),
  (4, 'srv-backup-node', '10.10.5.99', 'Ubuntu 24.04 LTS', 128, 'ONLINE');
`
};

/**
 * @typedef {object} SqlExecuteResult
 * @property {boolean} success
 * @property {any[]} rows
 * @property {number} rowCount
 * @property {number} [executionTimeMs]
 * @property {boolean} [isSelect]
 * @property {any} [raw]
 * @property {string} [error]
 */

/**
 * @param {import('./sqlWorkerCore').SqlStatementResult} res
 * @returns {SqlExecuteResult}
 */
const toExecuteResult = (res) => {
  if (!res.ok) {
    return { success: false, error: res.error, rows: [], rowCount: 0 };
  }
  const rows = Array.isArray(res.result) ? res.result : [];
  return {
    success: true,
    rows,
    rowCount: rows.length,
    executionTimeMs: Number(res.elapsedMs.toFixed(2)),
    isSelect: Array.isArray(res.result),
    raw: res.result
  };
};

/**
 * Eigene Datenbank je Instanz im gemeinsamen alasql-Worker. Alle Methoden mit
 * SQL-Zugriff sind asynchron, weil alasql im Worker läuft (sqlWorkerClient.js).
 */
export class SqlSandboxInstance {
  constructor() {
    this.dbName = 'sandbox_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Stellt jedem Auftrag das Anlegen/Auswählen der eigenen Datenbank voran,
   * weil sich andere Labs denselben Worker teilen.
   * @param {string[]} queries
   */
  async run(queries) {
    const results = await runSql([
      { sql: `CREATE DATABASE IF NOT EXISTS ${this.dbName}` },
      { sql: `USE ${this.dbName}` },
      ...queries.map((sql) => ({ sql }))
    ]);
    return results.slice(2);
  }

  /** @param {string} [seedName] */
  async loadSeed(seedName = 'ecommerce') {
    const sql = INITIAL_SQL_SEEDS[seedName] || INITIAL_SQL_SEEDS.ecommerce;
    return this.executeMultiple(sql);
  }

  /**
   * @param {string} query
   * @returns {Promise<SqlExecuteResult>}
   */
  async execute(query) {
    const [res] = await this.run([query]);
    return toExecuteResult(res);
  }

  /**
   * @param {string} sqlScript
   * @returns {Promise<SqlExecuteResult[]>}
   */
  async executeMultiple(sqlScript) {
    const statements = sqlScript
      .split(';')
      .map(/** @param {string} s */ s => s.trim())
      .filter(/** @param {string} s */ s => s.length > 0);
    const results = await this.run(statements);
    return results.map(toExecuteResult);
  }

  /** @returns {Promise<Record<string, { columns: string[], totalRows: number }>>} */
  async getSchema() {
    try {
      const [tablesRes] = await this.run(['SHOW TABLES']);
      if (!tablesRes.ok || !Array.isArray(tablesRes.result)) return {};
      /** @type {string[]} */
      const tableNames = tablesRes.result.map(/** @param {any} t */ t => t.tableid);
      const details = await this.run(tableNames.flatMap(name => [
        `SELECT * FROM ${name} LIMIT 1`,
        `SELECT COUNT(*) AS c FROM ${name}`
      ]));
      /** @type {Record<string, { columns: string[], totalRows: number }>} */
      const schema = {};
      tableNames.forEach((name, i) => {
        const sample = details[i * 2].result;
        const countRes = details[i * 2 + 1].result;
        schema[name] = {
          columns: Array.isArray(sample) && sample.length > 0 ? Object.keys(sample[0]) : [],
          totalRows: Array.isArray(countRes) && countRes[0] ? countRes[0].c : 0
        };
      });
      return schema;
    } catch {
      return {};
    }
  }

  /** @param {any[]} rows */
  exportToCsv(rows = []) {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];
    rows.forEach(r => {
      const line = headers.map(h => {
        const val = r[h] !== undefined ? String(r[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvLines.push(line);
    });
    return csvLines.join('\n');
  }

  destroy() {
    runSql([{ sql: `DROP DATABASE IF EXISTS ${this.dbName}` }]).catch(() => {
      // Worker beendet oder Datenbank schon weg - nichts zu tun
    });
  }
}

/**
 * Analysiert eine SQL-Eingabe auf SQL-Injection Vektoren und visualisiert den Unterschied
 * zwischen naiver String-Konkatenation vs. Prepared Statements (AST / Token-Ebene).
 * @param {string} userInput
 * @param {string} [baseQueryTemplate]
 */
export function analyzeSqlInjection(userInput = '', baseQueryTemplate = "SELECT * FROM users WHERE username = '$INPUT' AND status = 'active'") {
  const rawQuery = baseQueryTemplate.replace('$INPUT', userInput);

  // Gefährliche SQL-Injection Patterns (Tautologien, Kommentare, Stacked Queries, UNION)
  const isTautology = /(?:'|")\s*(?:OR|or|\|\|)\s*(?:1\s*=\s*1|'1'\s*=\s*'1'|[a-zA-Z0-9_]+\s*=\s*[a-zA-Z0-9_]+)/i.test(userInput);
  const hasCommentBypass = /(--|\/\*|#)/.test(userInput);
  const hasStackedQuery = /;\s*(?:DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE)/i.test(userInput);
  const hasUnionSelect = /\bUNION\b\s+(?:ALL\s+)?\bSELECT\b/i.test(userInput);

  const isInjected = isTautology || hasCommentBypass || hasStackedQuery || hasUnionSelect;

  let riskLevel = 'SAFE';
  const detectedVectors = [];

  if (isTautology) {
    riskLevel = 'CRITICAL';
    detectedVectors.push('Tautologie (OR 1=1) hebelt WHERE-Bedingung komplett aus');
  }
  if (hasCommentBypass) {
    if (riskLevel !== 'CRITICAL') riskLevel = 'HIGH';
    detectedVectors.push('SQL-Kommentar (-- / /*) schneidet nachfolgende Filter (z. B. Passwort-Check) ab');
  }
  if (hasStackedQuery) {
    riskLevel = 'CRITICAL';
    detectedVectors.push('Stacked Query (; DROP/DELETE) ermöglicht Datensabotage');
  }
  if (hasUnionSelect) {
    riskLevel = 'CRITICAL';
    detectedVectors.push('UNION-Based Injection schleust unautorisierte Datenstrukturen ein');
  }

  // Ast/Token Struktur veranschaulichen
  const naiveTokens = [
    { type: 'KEYWORD', value: 'SELECT * FROM users WHERE' },
    { type: isInjected ? 'INJECTED_CLAUSE' : 'LITERAL', value: `username = '${userInput}'` },
    { type: hasCommentBypass ? 'IGNORED_COMMENT' : 'KEYWORD', value: "AND status = 'active'" }
  ];

  const preparedTokens = [
    { type: 'PREPARED_STMT', value: 'SELECT * FROM users WHERE username = ? AND status = ?' },
    { type: 'SAFE_PARAMETER', value: `Param 1 (String): ${JSON.stringify(userInput)}` },
    { type: 'SAFE_PARAMETER', value: 'Param 2 (String): "active"' }
  ];

  return {
    rawQuery,
    userInput,
    isInjected,
    riskLevel,
    detectedVectors,
    comparison: {
      naiveConcatenation: {
        sql: rawQuery,
        executionSemantics: isInjected
          ? 'Der Eingabewert bricht aus dem Literal-String aus und wird direkt vom SQL-Parser als ausführbarer Befehl/Klausel interpretiert!'
          : 'Query wird als gültiger String-Vergleich ausgeführt.',
        tokens: naiveTokens
      },
      parameterizedQuery: {
        template: "SELECT * FROM users WHERE username = ? AND status = 'active'",
        params: [userInput],
        executionSemantics: 'Die Query-Struktur (AST) steht vorab fest kompiliert. Der Eingabewert wird strikt als Datenwert (String Literal) gebunden. Selbst Sonderzeichen wie \', -- oder OR 1=1 können den Befehlsbaum niemals verändern.',
        tokens: preparedTokens
      }
    }
  };
}

