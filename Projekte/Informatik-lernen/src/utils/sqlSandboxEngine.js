// @ts-check
import alasql from 'alasql';

/**
 * SQL Sandbox Engine powered by AlaSQL
 * Provides in-memory SQL execution, Schema introspection and table seed data.
 */

/** @type {Record<string, string>} */
export const INITIAL_SQL_SEEDS = {
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

export class SqlSandboxInstance {
  constructor() {
    this.dbName = 'sandbox_' + Math.random().toString(36).substring(2, 9);
    alasql(`CREATE DATABASE ${this.dbName}; USE ${this.dbName};`);
  }

  loadSeed(seedName = 'ecommerce') {
    const sql = INITIAL_SQL_SEEDS[seedName] || INITIAL_SQL_SEEDS.ecommerce;
    this.executeMultiple(sql);
  }

  /** @param {string} query */
  execute(query) {
    try {
      alasql(`USE ${this.dbName};`);
      const startTime = performance.now();
      const result = alasql(query);
      const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

      let rows = [];
      let isSelect = false;

      if (Array.isArray(result)) {
        rows = result;
        isSelect = true;
      }

      return {
        success: true,
        rows,
        rowCount: rows.length,
        executionTimeMs,
        isSelect,
        raw: result
      };
    } catch (error) {
      const e = /** @type {Error} */ (error);
      return {
        success: false,
        error: e.message || String(e),
        rows: [],
        rowCount: 0
      };
    }
  }

  /** @param {string} sqlScript */
  executeMultiple(sqlScript) {
    const statements = sqlScript
      .split(';')
      .map(/** @param {string} s */ s => s.trim())
      .filter(/** @param {string} s */ s => s.length > 0);

    const results = [];
    for (const stmt of statements) {
      results.push(this.execute(stmt));
    }
    return results;
  }

  getSchema() {
    try {
      alasql(`USE ${this.dbName};`);
      const tables = alasql('SHOW TABLES');
      const schema = {};

      if (Array.isArray(tables)) {
        tables.forEach(/** @param {any} t */ t => {
          const tableName = t.tableid;
          const sample = alasql(`SELECT * FROM ${tableName} LIMIT 1`);
          const countRes = alasql(`SELECT COUNT(*) AS c FROM ${tableName}`);
          const columns = sample && (/** @type {any} */ (sample)).length > 0 ? Object.keys((/** @type {any} */ (sample))[0]) : [];
          const totalRows = countRes && (/** @type {any} */ (countRes))[0] ? (/** @type {any} */ (countRes))[0].c : 0;
          /** @type {Record<string, any>} */ (schema)[tableName] = {
            columns,
            totalRows
          };
        });
      }
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
    try {
      alasql(`DROP DATABASE IF EXISTS ${this.dbName};`);
    } catch {
      // Ignore
    }
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
    { type: 'SAFE_PARAMETER', value: `Param 1 (String): "${userInput.replace(/"/g, '\\"')}"` },
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

