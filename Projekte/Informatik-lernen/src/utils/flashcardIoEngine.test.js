import { describe, it, expect } from 'vitest';
import { exportToAnkiTsv, exportToCsv, importFromCsvOrTsv } from './flashcardIoEngine';

describe('flashcardIoEngine', () => {
  const sampleCards = [
    {
      id: 1,
      category: 'Netzwerke',
      difficulty: 'Azubi / IHK',
      front: 'Was ist OSPF?',
      back: 'Open Shortest Path First - ein Link-State Routing-Protokoll.'
    },
    {
      id: 2,
      category: 'Datenbanken',
      difficulty: 'Expert',
      front: 'Was ist 3NF?',
      back: 'Keine transitiven Abhängigkeiten von Nicht-Schlüssel-Attributen.'
    }
  ];

  it('exports cards to Anki TSV format with tags header', () => {
    const tsv = exportToAnkiTsv(sampleCards);
    expect(tsv).toContain('#separator:tab');
    expect(tsv).toContain('Was ist OSPF?\tOpen Shortest Path First - ein Link-State Routing-Protokoll.\tNetzwerke_Azubi_/_IHK');
  });

  it('exports cards to RFC 4180 style CSV', () => {
    const csv = exportToCsv(sampleCards);
    expect(csv).toContain('ID;Kategorie;Schwierigkeit;Vorderseite;Rueckseite');
    expect(csv).toContain('1;Netzwerke;Azubi / IHK;Was ist OSPF?;Open Shortest Path First - ein Link-State Routing-Protokoll.');
  });

  it('imports cards from TSV text and recognizes content', () => {
    const rawTsv = `Vorderseite\tRückseite\tKategorie\nWas ist STP?\tSpanning Tree Protocol\tNetzwerke`;
    const { cards, errors } = importFromCsvOrTsv(rawTsv);
    expect(errors.length).toBe(0);
    expect(cards.length).toBe(1);
    expect(cards[0].front).toBe('Was ist STP?');
    expect(cards[0].back).toBe('Spanning Tree Protocol');
    expect(cards[0].category).toBe('Netzwerke');
  });
});
