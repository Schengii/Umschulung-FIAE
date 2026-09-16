/**
 * Relational ERD Designer & Normalization (1NF - 3NF) Engine
 */

export const INITIAL_ERD_SCHEMA = {
  entities: [
    {
      id: 'e_customers',
      name: 'customers',
      x: 60,
      y: 80,
      fields: [
        { id: 'f1', name: 'id', type: 'INTEGER', isPk: true, isNullable: false },
        { id: 'f2', name: 'company_name', type: 'VARCHAR(150)', isNullable: false },
        { id: 'f3', name: 'email', type: 'VARCHAR(100)', isNullable: false },
        { id: 'f4', name: 'city', type: 'VARCHAR(80)', isNullable: true },
        { id: 'f5', name: 'zip_code', type: 'VARCHAR(20)', isNullable: true }
      ]
    },
    {
      id: 'e_orders',
      name: 'orders',
      x: 380,
      y: 80,
      fields: [
        { id: 'f10', name: 'id', type: 'INTEGER', isPk: true, isNullable: false },
        { id: 'f11', name: 'customer_id', type: 'INTEGER', isFk: true, references: 'customers.id', isNullable: false },
        { id: 'f12', name: 'order_date', type: 'TIMESTAMP', isNullable: false },
        { id: 'f13', name: 'total_amount', type: 'DECIMAL(10,2)', isNullable: false },
        { id: 'f14', name: 'status', type: 'VARCHAR(30)', isNullable: false }
      ]
    },
    {
      id: 'e_order_items',
      name: 'order_items',
      x: 700,
      y: 80,
      fields: [
        { id: 'f20', name: 'id', type: 'INTEGER', isPk: true, isNullable: false },
        { id: 'f21', name: 'order_id', type: 'INTEGER', isFk: true, references: 'orders.id', isNullable: false },
        { id: 'f22', name: 'product_id', type: 'INTEGER', isFk: true, references: 'products.id', isNullable: false },
        { id: 'f23', name: 'quantity', type: 'INTEGER', isNullable: false },
        { id: 'f24', name: 'unit_price', type: 'DECIMAL(10,2)', isNullable: false }
      ]
    },
    {
      id: 'e_products',
      name: 'products',
      x: 700,
      y: 360,
      fields: [
        { id: 'f30', name: 'id', type: 'INTEGER', isPk: true, isNullable: false },
        { id: 'f31', name: 'sku', type: 'VARCHAR(50)', isNullable: false },
        { id: 'f32', name: 'name', type: 'VARCHAR(150)', isNullable: false },
        { id: 'f33', name: 'price', type: 'DECIMAL(10,2)', isNullable: false },
        { id: 'f34', name: 'stock_quantity', type: 'INTEGER', isNullable: false }
      ]
    }
  ],
  relationships: [
    { id: 'r1', from: 'e_customers', to: 'e_orders', fromField: 'id', toField: 'customer_id', cardinality: '1:N', name: 'places' },
    { id: 'r2', from: 'e_orders', to: 'e_order_items', fromField: 'id', toField: 'order_id', cardinality: '1:N', name: 'contains' },
    { id: 'r3', from: 'e_products', to: 'e_order_items', fromField: 'id', toField: 'product_id', cardinality: '1:N', name: 'referenced_in' }
  ]
};

/**
 * Normalization Rules Linter (1NF, 2NF, 3NF)
 */
export function auditNormalization(schema) {
  const issues = [];

  schema.entities.forEach(entity => {
    // 1NF Check: Primary key presence
    const pkFields = entity.fields.filter(f => f.isPk);
    if (pkFields.length === 0) {
      issues.push({
        level: 'ERROR',
        nf: '1NF',
        entityId: entity.id,
        entityName: entity.name,
        message: `Tabelle '${entity.name}' verletzt 1NF: Kein Primärschlüssel (Primary Key) definiert!`
      });
    }

    // 1NF Check: Multi-value or array indicators in field names
    entity.fields.forEach(f => {
      const lower = f.name.toLowerCase();
      if (lower.includes('list') || lower.includes('tags') || lower.includes('csv') || lower.includes('multiple') || lower.endsWith('s_names')) {
        issues.push({
          level: 'WARNING',
          nf: '1NF',
          entityId: entity.id,
          entityName: entity.name,
          fieldName: f.name,
          message: `Mögliche 1NF Verletzung in '${f.name}': Felder dürfen keine Wertelisten (Atomaritätsverletzung) enthalten.`
        });
      }
    });

    // 2NF Check: Partial dependency on composite PK
    if (pkFields.length > 1) {
      const nonPkFields = entity.fields.filter(f => !f.isPk && !f.isFk);
      nonPkFields.forEach(f => {
        if (f.name.toLowerCase().includes('customer_name') || f.name.toLowerCase().includes('product_name') || f.name.toLowerCase().includes('category_desc')) {
          issues.push({
            level: 'WARNING',
            nf: '2NF',
            entityId: entity.id,
            entityName: entity.name,
            fieldName: f.name,
            message: `Mögliche 2NF Verletzung in '${f.name}': Attribut hängt vermutlich nur von einem Teil des zusammengesetzten PKs ab.`
          });
        }
      });
    }

    // 3NF Check: Transitive dependencies (e.g. zip_code -> city)
    const hasZip = entity.fields.some(f => f.name.toLowerCase().includes('zip') || f.name.toLowerCase().includes('plz'));
    const hasCity = entity.fields.some(f => f.name.toLowerCase().includes('city') || f.name.toLowerCase().includes('ort') || f.name.toLowerCase().includes('stadt'));
    if (hasZip && hasCity && entity.name !== 'geo_locations' && entity.name !== 'cities') {
      issues.push({
        level: 'INFO',
        nf: '3NF',
        entityId: entity.id,
        entityName: entity.name,
        message: `Mögliche 3NF Redundanz in '${entity.name}': 'PLZ / Ort' ist eine transitive Abhängigkeit (PLZ -> Ort). Empfehlung: Eigene Referenztabelle auslagern.`
      });
    }
  });

  return issues;
}

/**
 * Generates SQL DDL for PostgreSQL / MySQL / SQLite
 */
export function generateSqlDdl(schema, dialect = 'postgres') {
  let sql = `-- ================================================\n`;
  sql += `-- Generated Database Schema (${dialect.toUpperCase()})\n`;
  sql += `-- IT-DevGame Relational ERD Studio v3.8\n`;
  sql += `-- ================================================\n\n`;

  schema.entities.forEach(entity => {
    sql += `CREATE TABLE ${entity.name} (\n`;
    const fieldLines = [];
    const pkFields = [];

    entity.fields.forEach(f => {
      let typeDef = f.type;
      if (dialect === 'sqlite' && f.type.startsWith('VARCHAR')) typeDef = 'TEXT';
      if (dialect === 'sqlite' && f.type.startsWith('DECIMAL')) typeDef = 'NUMERIC';

      let line = `  ${f.name.padEnd(20)} ${typeDef}`;
      if (!f.isNullable) line += ' NOT NULL';
      if (f.isPk && entity.fields.filter(x => x.isPk).length === 1) {
        line += ' PRIMARY KEY';
        if (dialect === 'postgres' && f.type === 'INTEGER') line = `  ${f.name.padEnd(20)} SERIAL PRIMARY KEY`;
      }
      fieldLines.push(line);

      if (f.isPk) pkFields.push(f.name);
    });

    if (pkFields.length > 1) {
      fieldLines.push(`  PRIMARY KEY (${pkFields.join(', ')})`);
    }

    // Add Foreign Key constraints
    schema.relationships
      .filter(r => r.to === entity.id)
      .forEach(r => {
        const fromEntity = schema.entities.find(e => e.id === r.from);
        if (fromEntity) {
          fieldLines.push(`  FOREIGN KEY (${r.toField}) REFERENCES ${fromEntity.name}(${r.fromField}) ON DELETE RESTRICT`);
        }
      });

    sql += fieldLines.join(',\n');
    sql += `\n);\n\n`;
  });

  return sql;
}
