import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqlSandboxInstance } from './sqlSandboxEngine';

describe('sqlSandboxEngine', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = new SqlSandboxInstance();
  });

  afterEach(() => {
    sandbox.destroy();
  });

  it('erstellt Tabellen und führt SELECT Queries aus', () => {
    sandbox.loadSeed('ecommerce');

    const res = sandbox.execute('SELECT * FROM customers WHERE city = "Berlin"');
    expect(res.success).toBe(true);
    expect(res.isSelect).toBe(true);
    expect(res.rowCount).toBe(1);
    expect(res.rows[0].name).toBe('Max Mustermann');
  });

  it('führt JOIN Queries über mehrere Tabellen aus', () => {
    sandbox.loadSeed('ecommerce');

    const joinRes = sandbox.execute(`
      SELECT c.name, o.id AS order_id, o.total_amount
      FROM customers c
      INNER JOIN orders o ON c.id = o.customer_id
      ORDER BY o.total_amount DESC
    `);

    expect(joinRes.success).toBe(true);
    expect(joinRes.rowCount).toBe(4);
    expect(joinRes.rows[0].total_amount).toBe(599.00);
  });

  it('erkennt fehlerhafte SQL Syntax und liefert Fehlermeldungen', () => {
    const errorRes = sandbox.execute('SELECT FROM WHERE INVALID SQL');
    expect(errorRes.success).toBe(false);
    expect(errorRes.error).toBeDefined();
  });

  it('ermittelt das Datenbankschema (Tabellen und Spalten)', () => {
    sandbox.loadSeed('ecommerce');
    const schema = sandbox.getSchema();

    expect(schema.customers).toBeDefined();
    expect(schema.customers.columns).toContain('email');
    expect(schema.orders).toBeDefined();
    expect(schema.orders.columns).toContain('total_amount');
  });

  it('exportiert Ergebniszeilen nach CSV', () => {
    const rows = [
      { id: 1, name: 'Alice', role: 'Admin' },
      { id: 2, name: 'Bob', role: 'User' }
    ];
    const csv = sandbox.exportToCsv(rows);
    expect(csv).toContain('id,name,role');
    expect(csv).toContain('"1","Alice","Admin"');
  });
});
