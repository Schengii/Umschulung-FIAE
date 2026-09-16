import alasql from 'alasql';

/**
 * SQL Sandbox Engine powered by AlaSQL
 * Provides in-memory SQL execution, Schema introspection and table seed data.
 */

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
      return {
        success: false,
        error: error.message || String(error),
        rows: [],
        rowCount: 0
      };
    }
  }

  executeMultiple(sqlScript) {
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

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
        tables.forEach(t => {
          const tableName = t.tableid;
          const sample = alasql(`SELECT * FROM ${tableName} LIMIT 1`);
          const countRes = alasql(`SELECT COUNT(*) AS c FROM ${tableName}`);
          const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
          const totalRows = countRes && countRes[0] ? countRes[0].c : 0;
          schema[tableName] = {
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
