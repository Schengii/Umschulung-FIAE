/**
 * PostgreSQL Index Types Deep Dive Engine
 * Vergleicht B-Tree, GIN, GiST und BRIN Indizes hinsichtlich Speicherbedarf, Abfragezeit und Einsatzzweck.
 */

export const INDEX_TYPES = {
  BTREE: {
    id: 'btree',
    name: 'B-Tree (Balanced Tree)',
    bestFor: 'Eindeutige IDs, Primärschlüssel, Gleichheits- & Bereichsabfragen (=, <, >, BETWEEN, ORDER BY)',
    operators: ['=', '<', '<=', '>', '>=', 'BETWEEN', 'IN', 'IS NULL'],
    sizeRatio: 0.22, // ca. 22% der Tabellengröße
    writeOverhead: 'Niedrig bis Mittel (Baum-Balancierung)'
  },
  GIN: {
    id: 'gin',
    name: 'GIN (Generalized Inverted Index)',
    bestFor: 'Volltextsuche (tsvector), JSONB (@>, ?), Arrays (&&, @>) und Tags',
    operators: ['@@', '@>', '?', '?|', '?&', '&&'],
    sizeRatio: 0.38, // ca. 38% der Tabellengröße (kann bei vielen Tokens wachsen)
    writeOverhead: 'Hoch (Mehrere Einträge pro Zeile aktualisieren)'
  },
  GIST: {
    id: 'gist',
    name: 'GiST (Generalized Search Tree)',
    bestFor: 'Geodaten (PostGIS), geometrische Polygone, Zeitbereiche (tsrange) & k-Nearest-Neighbor (<->)',
    operators: ['&&', '@>', '<@', '<->', '&<', '&>'],
    sizeRatio: 0.30,
    writeOverhead: 'Mittel'
  },
  BRIN: {
    id: 'brin',
    name: 'BRIN (Block Range Index)',
    bestFor: 'Riesige Tabellen (10M+ Zeilen) mit physikalisch sortierten Daten (z. B. zeitbasierte Logs, fortlaufende IDs)',
    operators: ['=', '<', '<=', '>', '>=', 'BETWEEN'],
    sizeRatio: 0.005, // < 1% der Tabellengröße! Speichert nur Min/Max pro 128 Pages
    writeOverhead: 'Extrem niedrig (nur Min/Max Aktualisierung bei Page-Grenzen)'
  }
};

/**
 * Berechnet geschätzte Speicher- und Geschwindigkeitsmetriken für einen Indextyp
 */
export function estimateIndexMetrics({
  indexType = 'btree',
  rowCount = 1000000,
  rowSizeBytes = 128,
  isPhysicallySorted = true
}) {
  const tableSizeMb = (rowCount * rowSizeBytes) / (1024 * 1024);
  const typeDef = INDEX_TYPES[indexType.toUpperCase()] || INDEX_TYPES.BTREE;

  // Indexgröße
  let indexSizeMb = tableSizeMb * typeDef.sizeRatio;
  if (indexType.toLowerCase() === 'brin' && !isPhysicallySorted) {
    // Wenn Daten nicht physikalisch sortiert sind, verliert BRIN an Effizienz
    indexSizeMb *= 1.2;
  }
  indexSizeMb = Number(Math.max(0.01, indexSizeMb).toFixed(2));

  // Typische Abfragezeit (Seq Scan vs. Index Scan)
  const seqScanMs = Number((tableSizeMb * 1.5).toFixed(1)); // z. B. 1.5ms pro MB Lesegeschwindigkeit
  let indexScanMs = 0.5;

  if (indexType.toLowerCase() === 'btree') {
    indexScanMs = Number((Math.log2(rowCount) * 0.05).toFixed(2)); // O(log N)
  } else if (indexType.toLowerCase() === 'gin') {
    indexScanMs = Number((Math.log2(rowCount) * 0.08).toFixed(2));
  } else if (indexType.toLowerCase() === 'gist') {
    indexScanMs = Number((Math.log2(rowCount) * 0.12).toFixed(2));
  } else if (indexType.toLowerCase() === 'brin') {
    // BRIN liest zunächst Min/Max (winzig), danach den entsprechenden Blockbereich (z. B. 128 Pages)
    indexScanMs = isPhysicallySorted ? 4.5 : seqScanMs * 0.85;
  }

  const speedup = Number((seqScanMs / Math.max(0.1, indexScanMs)).toFixed(1));

  return {
    indexType,
    tableSizeMb: Number(tableSizeMb.toFixed(2)),
    indexSizeMb,
    seqScanMs,
    indexScanMs,
    speedup,
    writeCostMultiplier: indexType.toLowerCase() === 'gin' ? 3.5 : indexType.toLowerCase() === 'brin' ? 0.2 : 1.0
  };
}

/**
 * Automatische Empfehlungs-Engine für den optimalen PostgreSQL Indextyp
 */
export function recommendIndexType({
  dataType = 'timestamp', // 'integer', 'varchar', 'jsonb', 'geometry', 'timestamp', 'array'
  queryPattern = 'range',  // 'equality', 'range', 'fulltext', 'contains', 'spatial'
  tableRows = 5000000,
  isClusteredOrAppended = true
}) {
  if (dataType === 'jsonb' || dataType === 'array' || queryPattern === 'fulltext' || queryPattern === 'contains') {
    return {
      recommendedType: 'gin',
      sqlSnippet: 'CREATE INDEX idx_data_gin ON tbl USING gin (payload jsonb_path_ops);',
      reason: 'GIN invertiert interne Schlüssel/Elemente und ermöglicht schnelle `@>` und Volltext-Abfragen, die B-Trees nicht beschleunigen können.'
    };
  }

  if (dataType === 'geometry' || queryPattern === 'spatial') {
    return {
      recommendedType: 'gist',
      sqlSnippet: 'CREATE INDEX idx_geo_gist ON locations USING gist (geom);',
      reason: 'GiST (R-Tree Struktur) ist für 2D/3D Koordinaten, Polygone und Bounding-Box-Überschneidungen (`&&`) zwingend erforderlich.'
    };
  }

  if (tableRows >= 2000000 && isClusteredOrAppended && (dataType === 'timestamp' || dataType === 'integer')) {
    return {
      recommendedType: 'brin',
      sqlSnippet: 'CREATE INDEX idx_logs_created_brin ON logs USING brin (created_at) WITH (pages_per_range = 128);',
      reason: 'BRIN spart über 98% Speicherplatz gegenüber B-Tree bei Millionen chronologisch wachsender Zeilen, indem nur Min/Max pro 128 Pages indiziert werden.'
    };
  }

  return {
    recommendedType: 'btree',
    sqlSnippet: 'CREATE INDEX idx_entity_btree ON entities (customer_id);',
    reason: 'Standard B-Tree ist der bewährte Allrounder für exakte Suchen (`=`), Sortierungen (`ORDER BY`) und reguläre Bereichsabfragen (`BETWEEN`).'
  };
}
