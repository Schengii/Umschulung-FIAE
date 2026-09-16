import { describe, it, expect } from 'vitest';
import { INITIAL_ERD_SCHEMA, auditNormalization, generateSqlDdl } from './erdDesignerEngine';

describe('erdDesignerEngine', () => {
  it('identifies valid schema structure', () => {
    expect(INITIAL_ERD_SCHEMA.entities.length).toBe(4);
    expect(INITIAL_ERD_SCHEMA.relationships.length).toBe(3);
  });

  it('runs normalization audit on initial schema', () => {
    const issues = auditNormalization(INITIAL_ERD_SCHEMA);
    expect(Array.isArray(issues)).toBe(true);
    // Should detect transitive dependency on zip/city
    const transitive = issues.find(i => i.nf === '3NF');
    expect(transitive).toBeDefined();
  });

  it('generates clean Postgres & SQLite DDL SQL', () => {
    const pgSql = generateSqlDdl(INITIAL_ERD_SCHEMA, 'postgres');
    expect(pgSql).toContain('CREATE TABLE customers');
    expect(pgSql).toContain('FOREIGN KEY (customer_id) REFERENCES customers(id)');

    const sqliteSql = generateSqlDdl(INITIAL_ERD_SCHEMA, 'sqlite');
    expect(sqliteSql).toContain('CREATE TABLE orders');
  });
});
