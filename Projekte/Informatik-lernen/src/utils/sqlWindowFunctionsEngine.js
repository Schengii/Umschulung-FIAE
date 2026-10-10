// @ts-check
/**
 * SQL Window Functions Engine
 * Didaktische Engine zur Simulation und Demonstration von SQL-Fensterfunktionen:
 * ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), LEAD(), LAG(), FIRST_VALUE(), LAST_VALUE(),
 * sowie kumulative Aggregationen (SUM() OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...)).
 */

/**
 * @typedef {Object} EmployeeRecord
 * @property {number} id
 * @property {string} name
 * @property {string} department
 * @property {number} salary
 * @property {string} hire_date
 * @property {number} sales_volume
 */

/** @type {EmployeeRecord[]} */
export const SAMPLE_EMPLOYEE_DATA = [
  { id: 1, name: 'Alice Müller', department: 'Entwicklung', salary: 68000, hire_date: '2022-03-01', sales_volume: 120000 },
  { id: 2, name: 'Bob Schmidt', department: 'Entwicklung', salary: 72000, hire_date: '2021-06-15', sales_volume: 95000 },
  { id: 3, name: 'Clara Weber', department: 'Entwicklung', salary: 68000, hire_date: '2023-01-10', sales_volume: 140000 },
  { id: 4, name: 'David Fischer', department: 'Vertrieb', salary: 55000, hire_date: '2020-09-01', sales_volume: 310000 },
  { id: 5, name: 'Emma Braun', department: 'Vertrieb', salary: 58000, hire_date: '2021-11-20', sales_volume: 420000 },
  { id: 6, name: 'Felix Koch', department: 'Vertrieb', salary: 55000, hire_date: '2022-05-01', sales_volume: 290000 },
  { id: 7, name: 'Greta Meyer', department: 'Vertrieb', salary: 62000, hire_date: '2019-04-15', sales_volume: 490000 },
  { id: 8, name: 'Hanno Wolf', department: 'Cloud / DevOps', salary: 75000, hire_date: '2020-02-01', sales_volume: 80000 },
  { id: 9, name: 'Ines Wagner', department: 'Cloud / DevOps', salary: 79000, hire_date: '2019-08-01', sales_volume: 110000 },
  { id: 10, name: 'Jonas Becker', department: 'Cloud / DevOps', salary: 75000, hire_date: '2023-04-01', sales_volume: 65000 }
];

/**
 * Führt Window Functions auf einem Datensatz aus
 * @param {Object} options
 * @param {EmployeeRecord[]} [options.data]
 * @param {'none' | 'department'} [options.partitionBy]
 * @param {'salary' | 'sales_volume' | 'hire_date'} [options.orderBy]
 * @param {'ASC' | 'DESC'} [options.direction]
 * @param {number} [options.ntileBuckets]
 */
export function executeWindowFunctions({
  data = SAMPLE_EMPLOYEE_DATA,
  partitionBy = 'department',
  orderBy = 'salary',
  direction = 'DESC',
  ntileBuckets = 3
}) {
  const records = [...data];

  // Gruppieren für Partition By
  /** @type {Record<string, EmployeeRecord[]>} */
  const partitions = {};

  records.forEach(rec => {
    const key = partitionBy === 'department' ? rec.department : 'ALL';
    if (!partitions[key]) partitions[key] = [];
    partitions[key].push(rec);
  });

  /** @type {Array<EmployeeRecord & {
   *   row_number: number,
   *   rank: number,
   *   dense_rank: number,
   *   ntile: number,
   *   lag_val: number|string|null,
   *   lead_val: number|string|null,
   *   running_total: number,
   *   dept_avg: number
   * }>} */
  const result = [];

  Object.entries(partitions).forEach(([, partitionRecords]) => {
    // Sortieren innerhalb der Partition
    partitionRecords.sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];
      if (valA < valB) return direction === 'ASC' ? -1 : 1;
      if (valA > valB) return direction === 'ASC' ? 1 : -1;
      return 0;
    });

    const deptSum = partitionRecords.reduce((s, r) => s + (orderBy === 'sales_volume' ? r.sales_volume : r.salary), 0);
    const deptAvg = Math.round(deptSum / partitionRecords.length);

    let currentRank = 1;
    let currentDenseRank = 1;
    let runningTotal = 0;

    partitionRecords.forEach((row, idx) => {
      const targetVal = orderBy === 'sales_volume' ? row.sales_volume : row.salary;
      runningTotal += targetVal;

      if (idx > 0) {
        const prevVal = orderBy === 'sales_volume' ? partitionRecords[idx - 1].sales_volume : partitionRecords[idx - 1].salary;
        if (targetVal === prevVal) {
          // Gleicher Wert -> gleicher Rank und Dense Rank
        } else {
          currentRank = idx + 1; // Rank springt
          currentDenseRank += 1; // Dense Rank lückenlos
        }
      }

      // NTILE Berechnung
      const bucketSize = partitionRecords.length / ntileBuckets;
      const ntile = Math.min(ntileBuckets, Math.floor(idx / bucketSize) + 1);

      // LAG & LEAD
      const prevRecord = idx > 0 ? partitionRecords[idx - 1] : null;
      const nextRecord = idx < partitionRecords.length - 1 ? partitionRecords[idx + 1] : null;

      const lagVal = prevRecord ? (orderBy === 'sales_volume' ? prevRecord.sales_volume : prevRecord.salary) : null;
      const leadVal = nextRecord ? (orderBy === 'sales_volume' ? nextRecord.sales_volume : nextRecord.salary) : null;

      result.push({
        ...row,
        row_number: idx + 1,
        rank: currentRank,
        dense_rank: currentDenseRank,
        ntile,
        lag_val: lagVal,
        lead_val: leadVal,
        running_total: runningTotal,
        dept_avg: deptAvg
      });
    });
  });

  return {
    count: result.length,
    partitionBy,
    orderBy,
    direction,
    data: result
  };
}

/**
 * Generiert die äquivalente Standard-SQL-Abfrage
 * @param {string} partitionBy
 * @param {string} orderBy
 * @param {string} direction
 * @param {number} ntile
 */
export function generateWindowFunctionSql(partitionBy = 'department', orderBy = 'salary', direction = 'DESC', ntile = 3) {
  const overClause = partitionBy === 'department'
    ? `PARTITION BY department ORDER BY ${orderBy} ${direction}`
    : `ORDER BY ${orderBy} ${direction}`;

  return `-- ANSI SQL:2003 Standard Window Functions (PostgreSQL, SQLite 3.25+, MySQL 8.0+)
SELECT 
  id,
  name,
  department,
  salary,
  sales_volume,
  -- 1. Fortlaufende Nummerierung
  ROW_NUMBER() OVER (${overClause}) AS row_num,
  -- 2. Rang mit Lücken bei Gleichstand (1, 1, 3)
  RANK() OVER (${overClause}) AS rnk,
  -- 3. Rang ohne Lücken (1, 1, 2)
  DENSE_RANK() OVER (${overClause}) AS dense_rnk,
  -- 4. Aufteilung in ${ntile} Quartile/Terzile
  NTILE(${ntile}) OVER (${overClause}) AS bucket,
  -- 5. Vorheriger und Nachfolgender Datensatz
  LAG(${orderBy}, 1) OVER (${overClause}) AS prev_${orderBy},
  LEAD(${orderBy}, 1) OVER (${overClause}) AS next_${orderBy},
  -- 6. Kumulierende Summe (Running Total)
  SUM(${orderBy}) OVER (
    ${overClause} 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM employees;`;
}
