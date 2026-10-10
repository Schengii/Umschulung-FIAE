import { describe, it, expect } from 'vitest';
import {
  UNNORMALIZED_ORDER_DATA,
  FIRST_NORMAL_FORM_TABLE,
  SECOND_NORMAL_FORM_TABLES,
  THIRD_NORMAL_FORM_TABLES,
  DATABASE_ANOMALIES,
  evaluateNormalForm,
  NORMALIZATION_DRILL_QUESTIONS
} from './databaseNormalizationEngine';

describe('databaseNormalizationEngine', () => {
  it('enthält alle Stufen der Normalisierung und Anomalien', () => {
    expect(UNNORMALIZED_ORDER_DATA.length).toBe(3);
    expect(FIRST_NORMAL_FORM_TABLE.columns.length).toBe(10);
    expect(SECOND_NORMAL_FORM_TABLES.length).toBe(3);
    expect(THIRD_NORMAL_FORM_TABLES.length).toBe(5);
    expect(DATABASE_ANOMALIES.length).toBe(3);
    expect(NORMALIZATION_DRILL_QUESTIONS.length).toBe(4);
  });

  describe('evaluateNormalForm', () => {
    it('evaluiert 1NF Kriterien', () => {
      const res = evaluateNormalForm('1NF');
      expect(res.valid).toBe(true);
      expect(res.rule).toContain('atomar');
      expect(res.criteria.length).toBe(3);
    });

    it('evaluiert 2NF Kriterien', () => {
      const res = evaluateNormalForm('2NF');
      expect(res.valid).toBe(true);
      expect(res.rule).toContain('voll funktional abhängig');
    });

    it('evaluiert 3NF Kriterien', () => {
      const res = evaluateNormalForm('3NF');
      expect(res.valid).toBe(true);
      expect(res.rule).toContain('transitiv');
    });

    it('gibt false für unbekannte Stufen zurück', () => {
      const res = evaluateNormalForm('UNKNOWN');
      expect(res.valid).toBe(false);
    });
  });

  describe('Struktur der 3NF Tabellen', () => {
    it('trennt Orte und Kunden sauber ab', () => {
      const kundenTable = THIRD_NORMAL_FORM_TABLES.find(t => t.name === 'Kunden');
      const orteTable = THIRD_NORMAL_FORM_TABLES.find(t => t.name === 'Orte');
      expect(kundenTable).toBeDefined();
      expect(orteTable).toBeDefined();
      expect(orteTable.primaryKey).toEqual(['PLZ']);
      expect(kundenTable.primaryKey).toEqual(['KundenNr']);
    });
  });
});
