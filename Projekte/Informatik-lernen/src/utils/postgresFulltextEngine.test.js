import { describe, it, expect } from 'vitest';
import { toTsVector, evaluateTsQuery } from './postgresFulltextEngine';

describe('PostgreSQL Full-Text Search Engine', () => {
  it('converts German text into stemmed tsvector with word positions', () => {
    const res = toTsVector('Der schnelle Datenbank Server speichert alle Tabellen');
    expect(res.formattedVector).toContain("'datenbank'");
    expect(res.formattedVector).toContain("'serv'");
    expect(res.lexemeMap['serv']).toEqual([3]);
  });

  it('evaluates boolean tsquery matching against tsvector', () => {
    const vector = toTsVector('PostgreSQL ist ein leistungsfähiger Datenbank Server');
    const matchRes = evaluateTsQuery(vector, 'datenbank & server');

    expect(matchRes.isMatch).toBe(true);
    expect(matchRes.rankScore).toBeGreaterThan(0);

    const nonMatchRes = evaluateTsQuery(vector, 'datenbank & oracle');
    expect(nonMatchRes.isMatch).toBe(false);
  });
});
