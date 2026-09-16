import { describe, it, expect } from 'vitest';
import { 
  estimateIndexMetrics, 
  recommendIndexType 
} from './postgresIndexTypesEngine';

describe('postgresIndexTypesEngine', () => {
  it('liefert Metriken für alle 4 Indextypen', () => {
    const rowCount = 1000000;
    const btree = estimateIndexMetrics({ indexType: 'btree', rowCount });
    const brin = estimateIndexMetrics({ indexType: 'brin', rowCount });
    const gin = estimateIndexMetrics({ indexType: 'gin', rowCount });
    const gist = estimateIndexMetrics({ indexType: 'gist', rowCount });

    expect(btree.indexSizeMb).toBeGreaterThan(brin.indexSizeMb);
    expect(brin.indexSizeMb).toBeLessThan(btree.indexSizeMb * 0.05); // BRIN ist massiv kleiner
    expect(gin.writeCostMultiplier).toBeGreaterThan(btree.writeCostMultiplier);
    expect(gist.indexScanMs).toBeGreaterThan(0);
  });

  it('empfiehlt GIN für JSONB und Volltextsuche', () => {
    const rec = recommendIndexType({ dataType: 'jsonb', queryPattern: 'contains' });
    expect(rec.recommendedType).toBe('gin');
    expect(rec.sqlSnippet).toContain('USING gin');
  });

  it('empfiehlt GiST für räumliche Geodaten', () => {
    const rec = recommendIndexType({ dataType: 'geometry', queryPattern: 'spatial' });
    expect(rec.recommendedType).toBe('gist');
    expect(rec.sqlSnippet).toContain('USING gist');
  });

  it('empfiehlt BRIN für gigantische zeitbasierte Tabellen', () => {
    const rec = recommendIndexType({
      dataType: 'timestamp',
      queryPattern: 'range',
      tableRows: 10000000,
      isClusteredOrAppended: true
    });
    expect(rec.recommendedType).toBe('brin');
    expect(rec.sqlSnippet).toContain('USING brin');
    expect(rec.reason).toContain('BRIN');
  });
});
