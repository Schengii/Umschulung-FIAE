import { describe, it, expect } from 'vitest';
import { executeWindowFunctions, generateWindowFunctionSql } from './sqlWindowFunctionsEngine';

describe('SQL Window Functions Engine', () => {
  it('correctly calculates ROW_NUMBER, RANK and DENSE_RANK on salary with ties', () => {
    const res = executeWindowFunctions({
      partitionBy: 'department',
      orderBy: 'salary',
      direction: 'DESC'
    });

    expect(res.data.length).toBe(10);

    // In Entwicklung: Bob (72k), Alice (68k), Clara (68k)
    const entwicklung = res.data.filter(r => r.department === 'Entwicklung');
    expect(entwicklung[0].name).toBe('Bob Schmidt');
    expect(entwicklung[0].row_number).toBe(1);
    expect(entwicklung[0].rank).toBe(1);
    expect(entwicklung[0].dense_rank).toBe(1);

    // Alice und Clara haben beide 68k:
    expect(entwicklung[1].rank).toBe(2);
    expect(entwicklung[2].rank).toBe(2); // Gleichstand bei Rank
    expect(entwicklung[1].dense_rank).toBe(2);
    expect(entwicklung[2].dense_rank).toBe(2);
  });

  it('computes LAG, LEAD and running totals correctly', () => {
    const res = executeWindowFunctions({
      partitionBy: 'none',
      orderBy: 'salary',
      direction: 'ASC'
    });

    const first = res.data[0];
    expect(first.lag_val).toBeNull();
    expect(first.lead_val).toBeDefined();

    // Letzter Eintrag muss höchsten kumulierten Wert haben
    const last = res.data[res.data.length - 1];
    expect(last.lead_val).toBeNull();
    expect(last.running_total).toBeGreaterThan(500000);
  });

  it('generates valid ANSI SQL query string', () => {
    const sql = generateWindowFunctionSql('department', 'sales_volume', 'DESC', 4);
    expect(sql).toContain('PARTITION BY department ORDER BY sales_volume DESC');
    expect(sql).toContain('ROW_NUMBER()');
    expect(sql).toContain('DENSE_RANK()');
    expect(sql).toContain('NTILE(4)');
  });
});
