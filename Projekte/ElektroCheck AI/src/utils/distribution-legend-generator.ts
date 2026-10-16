import type { TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { downloadPdf } from './pdf-generator';

export interface CircuitEntry {
  circuitNumber: string; // z.B. F1, F2, Q1
  name: string;          // z.B. Steckdosen Werkstatt
  mcbRating: string;     // z.B. B16A
  cableType: string;     // z.B. NYM-J 3x1.5
  rcdGroup: string;      // z.B. RCD 1 (30mA)
  room: string;          // z.B. EG Werkstatt
}

export interface DistributionBoardData {
  boardName: string;     // z.B. Unterverteiler Werkstatt (UV-01)
  location: string;      // z.B. Halle 2, Nordwand
  ratedVoltage: string;  // z.B. 230/400V 50Hz
  incomingFeed: string;  // z.B. 5x10mm² / 50A
  circuits: CircuitEntry[];
  inspectorName?: string;
  date?: string;
}

/**
 * Erstellt eine druckfertige Stromkreis-Legende (Schaltschrank-Türbeschriftung) als PDF
 */
export function buildDistributionLegendPdf(data: DistributionBoardData): TDocumentDefinitions {
  const dateStr = data.date || new Date().toLocaleDateString('de-DE');

  const tableBody: TableCell[][] = [
    [
      { text: 'Nr.', bold: true, fillColor: '#0284c7', color: '#ffffff', alignment: 'center' },
      { text: 'Stromkreis / Verbraucher', bold: true, fillColor: '#0284c7', color: '#ffffff' },
      { text: 'Absicherung', bold: true, fillColor: '#0284c7', color: '#ffffff', alignment: 'center' },
      { text: 'Leitung', bold: true, fillColor: '#0284c7', color: '#ffffff' },
      { text: 'RCD / FI', bold: true, fillColor: '#0284c7', color: '#ffffff' },
      { text: 'Raum / Bereich', bold: true, fillColor: '#0284c7', color: '#ffffff' }
    ]
  ];

  data.circuits.forEach((c, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableBody.push([
      { text: c.circuitNumber, bold: true, alignment: 'center', fillColor: bg },
      { text: c.name, fillColor: bg },
      { text: c.mcbRating, alignment: 'center', fillColor: bg },
      { text: c.cableType, fillColor: bg },
      { text: c.rcdGroup, fillColor: bg },
      { text: c.room, fillColor: bg }
    ]);
  });

  return {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [20, 20, 20, 20],
    content: [
      {
        columns: [
          {
            text: `STROMKREISVERZEICHNIS / LEGENDE`,
            fontSize: 16,
            bold: true,
            color: '#0284c7'
          },
          {
            text: `Stand: ${dateStr}`,
            alignment: 'right',
            fontSize: 10,
            color: '#64748b'
          }
        ],
        margin: [0, 0, 0, 10]
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 1.5, lineColor: '#0284c7' }],
        margin: [0, 0, 0, 10]
      },
      {
        columns: [
          { text: [{ text: 'Verteilung: ', bold: true }, data.boardName], fontSize: 10 },
          { text: [{ text: 'Standort: ', bold: true }, data.location], fontSize: 10 },
          { text: [{ text: 'Nennspannung: ', bold: true }, data.ratedVoltage], fontSize: 10 },
          { text: [{ text: 'Zuleitung: ', bold: true }, data.incomingFeed], fontSize: 10 }
        ],
        margin: [0, 0, 0, 12]
      },
      {
        table: {
          headerRows: 1,
          widths: ['7%', '33%', '12%', '16%', '16%', '16%'],
          body: tableBody
        },
        layout: {
          hLineWidth: (i: number, node: { table: { body: unknown[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 1.5 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cbd5e1',
          vLineColor: () => '#cbd5e1',
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5
        }
      },
      {
        text: `Dokumentation nach DIN EN 61439 / DIN VDE 0100-510. Erstellt mit ElektroCheck AI.`,
        fontSize: 8,
        color: '#94a3b8',
        margin: [0, 15, 0, 0],
        alignment: 'center'
      }
    ],
    defaultStyle: {
      fontSize: 9
    }
  };
}

export async function downloadDistributionLegend(data: DistributionBoardData, filename = 'stromkreisverzeichnis.pdf') {
  const doc = buildDistributionLegendPdf(data);
  await downloadPdf(doc, filename);
}
