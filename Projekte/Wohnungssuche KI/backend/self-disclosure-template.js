import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Generiert eine Mieterselbstauskunft als PDF-Buffer unter Verwendung von pdf-lib.
 * @param {Object} data Die Formulardaten des Benutzers.
 */
export async function generateSelfDisclosurePdf(data) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
  const fontRegular = await pdfDoc.embedFont('Helvetica');
  const page = pdfDoc.addPage([595.28, 841.89]); // A4-Format

  // Dekorativer Header (Dunkelblau/Teal passend zur App-Designlinie)
  page.drawRectangle({
    x: 0,
    y: 770,
    width: 595.28,
    height: 71.89,
    color: rgb(0.06, 0.45, 0.55),
  });

  page.drawText('MIETERSELBSTAUSKUNFT', {
    x: 40,
    y: 800,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Freiwillige Selbstauskunft für die Anmietung einer Wohnung', {
    x: 40,
    y: 783,
    size: 9,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  let currentY = 735;

  // Hilfsfunktion zum Zeichnen von Bereichsüberschriften
  const drawSectionHeader = (title) => {
    page.drawRectangle({
      x: 40,
      y: currentY - 5,
      width: 515,
      height: 20,
      color: rgb(0.92, 0.95, 0.96),
    });
    page.drawText(title, {
      x: 45,
      y: currentY,
      size: 10,
      font: fontBold,
      color: rgb(0.06, 0.45, 0.55),
    });
    currentY -= 25;
  };

  // Hilfsfunktion für Tabellenzeilen mit 2 Bewerberspalten
  const drawRow2Col = (label, val1, val2, boldLabel = false) => {
    page.drawText(label, { x: 45, y: currentY, size: 9, font: boldLabel ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(val1 || '-', { x: 220, y: currentY, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    page.drawText(val2 || '-', { x: 390, y: currentY, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    
    // Trennlinie
    page.drawLine({
      start: { x: 40, y: currentY - 5 },
      end: { x: 555, y: currentY - 5 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    currentY -= 20;
  };

  // Hilfsfunktion für volle Breite Zeilen (z.B. Fragen)
  const drawRowFull = (label, value) => {
    page.drawText(label, { x: 45, y: currentY, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    
    const textWidth = fontRegular.widthOfTextAtSize(value || '-', 9);
    const wrapLimit = 320;
    if (textWidth > wrapLimit) {
      // Zeilenumbruch falls nötig
      const words = (value || '-').split(' ');
      let line = '';
      let lineY = currentY;
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (fontRegular.widthOfTextAtSize(testLine, 9) > wrapLimit) {
          page.drawText(line, { x: 220, y: lineY, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
          line = word;
          lineY -= 12;
        } else {
          line = testLine;
        }
      }
      page.drawText(line, { x: 220, y: lineY, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY = lineY - 15;
    } else {
      page.drawText(value || '-', { x: 220, y: currentY, size: 9, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 20;
    }

    page.drawLine({
      start: { x: 40, y: currentY + 15 },
      end: { x: 555, y: currentY + 15 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
  };

  // 1. Mietobjekt (falls ausgefüllt)
  if (data.address) {
    drawSectionHeader('Angaben zum Mietobjekt');
    drawRowFull('Gewünschtes Objekt:', `${data.address} ${data.flatDetail ? `(${data.flatDetail})` : ''}`);
  }

  // 2. Persönliche Daten
  drawSectionHeader('Persönliche Angaben der Bewerber');
  
  // Spaltenüberschriften
  page.drawText('Merkmal / Detail', { x: 45, y: currentY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('Bewerber 1 (Hauptmieter)', { x: 220, y: currentY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('Bewerber 2 (Mitmieter / Partner)', { x: 390, y: currentY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawLine({
    start: { x: 40, y: currentY - 5 },
    end: { x: 555, y: currentY - 5 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  currentY -= 20;

  drawRow2Col('Name, Vorname', data.p1Name, data.p2Name);
  drawRow2Col('Geburtsdatum', data.p1Birthdate, data.p2Birthdate);
  drawRow2Col('Geburtsort', data.p1Birthplace, data.p2Birthplace);
  drawRow2Col('Aktuelle Anschrift', data.p1Address, data.p2Address);
  drawRow2Col('Telefonnummer', data.p1Phone, data.p2Phone);
  drawRow2Col('E-Mail-Adresse', data.p1Email, data.p2Email);
  drawRow2Col('Ausgeübter Beruf', data.p1Job, data.p2Job);
  drawRow2Col('Aktueller Arbeitgeber', data.p1Employer, data.p2Employer);
  drawRow2Col('Nettoeinkommen (mtl.)', data.p1Income ? `${data.p1Income} €` : '', data.p2Income ? `${data.p2Income} €` : '');

  // 3. Allgemeine Erklärungen
  currentY -= 10;
  drawSectionHeader('Wichtige Erklärungen & Fragen');

  const jaNein = (val) => val === true || val === 'true' || val === 'yes' ? 'Ja' : 'Nein';

  drawRowFull('Bestehen Mietrückstände aus bisherigen Mietverhältnissen?', jaNein(data.rentArrears));
  drawRowFull('Wurde in den letzten 5 Jahren Insolvenzverfahren eröffnet?', jaNein(data.bankruptcy));
  drawRowFull('Bestehen Pfändungen oder Zwangsvollstreckungen?', jaNein(data.foreclosure));
  drawRowFull('Werden Haustiere mit einziehen?', data.pets === 'yes' ? `Ja (Details: ${data.petDetails || ''})` : 'Nein');
  drawRowFull('Wird die Miete über das Amt (Jobcenter/Sozialamt) bezahlt?', jaNein(data.socialAssistance));

  // Rechtliche Belehrung
  currentY -= 15;
  page.drawText('Einwilligung & Richtigkeit:', { x: 45, y: currentY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  currentY -= 15;

  const disclaimer = 'Ich/Wir versichere(n), dass alle gemachten Angaben der Wahrheit entsprechen. Mir/Uns ist bewusst, dass falsche Angaben den Vermieter zur sofortigen Kündigung oder Anfechtung des geschlossenen Mietvertrages berechtigen.';
  const disclaimerWords = disclaimer.split(' ');
  let discLine = '';
  for (const word of disclaimerWords) {
    const testLine = discLine ? `${discLine} ${word}` : word;
    if (fontRegular.widthOfTextAtSize(testLine, 8) > 515) {
      page.drawText(discLine, { x: 45, y: currentY, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
      discLine = word;
      currentY -= 12;
    } else {
      discLine = testLine;
    }
  }
  page.drawText(discLine, { x: 45, y: currentY, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

  currentY -= 35;

  // Unterschriftenbereich
  page.drawText('Ort, Datum:', { x: 45, y: currentY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  page.drawText('Unterschrift Bewerber 1:', { x: 220, y: currentY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  if (data.p2Name) {
    page.drawText('Unterschrift Bewerber 2:', { x: 390, y: currentY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  }

  page.drawLine({ start: { x: 45, y: currentY - 20 }, end: { x: 180, y: currentY - 20 }, thickness: 0.75, color: rgb(0.7, 0.7, 0.7) });
  page.drawLine({ start: { x: 220, y: currentY - 20 }, end: { x: 350, y: currentY - 20 }, thickness: 0.75, color: rgb(0.7, 0.7, 0.7) });
  if (data.p2Name) {
    page.drawLine({ start: { x: 390, y: currentY - 20 }, end: { x: 520, y: currentY - 20 }, thickness: 0.75, color: rgb(0.7, 0.7, 0.7) });
  }

  return await pdfDoc.save();
}
