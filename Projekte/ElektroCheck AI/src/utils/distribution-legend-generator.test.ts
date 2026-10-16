import { describe, it, expect } from 'vitest';
import { buildDistributionLegendPdf } from './distribution-legend-generator';

describe('buildDistributionLegendPdf', () => {
  it('erstellt eine gültige PDF-Definition im Querformat für eine Unterverteilung', () => {
    const doc = buildDistributionLegendPdf({
      boardName: 'UV-EG',
      location: 'Hauptverteilerraum',
      ratedVoltage: '230/400V 50Hz',
      incomingFeed: '5x10mm²',
      circuits: [
        {
          circuitNumber: 'F1',
          name: 'Licht Flur',
          mcbRating: 'B10',
          cableType: 'NYM-J 3x1.5',
          rcdGroup: 'RCD 1',
          room: 'EG Flur'
        }
      ],
      inspectorName: 'Max Mustermann'
    });

    expect(doc.pageSize).toBe('A4');
    expect(doc.pageOrientation).toBe('landscape');
    expect(Array.isArray(doc.content)).toBe(true);
  });
});
