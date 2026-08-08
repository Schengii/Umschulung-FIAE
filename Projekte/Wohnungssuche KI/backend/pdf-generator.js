import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');

/**
 * Generiert die Bewerbungsmappe im Arbeitsspeicher (in-memory) als PDF-Buffer.
 * Unterstüzt Partner-Modus und dynamische Wasserzeichen.
 * @param {string} title 
 * @param {string[]} documentIds 
 * @param {string} [watermarkText] Optionales Wasserzeichen (z. B. "Nur zur Bewerbung Musterstraße 12")
 */
export async function generatePortfolioBuffer(title, documentIds, watermarkText = '') {
  const mergedPdf = await PDFDocument.create();
  
  // Standard-Schriften einbetten
  const fontBold = await mergedPdf.embedFont('Helvetica-Bold');
  const fontRegular = await mergedPdf.embedFont('Helvetica');
  
  // 1. Deckblatt hinzufügen (A4: 595.28 x 841.89 points)
  const coverPage = mergedPdf.addPage([595.28, 841.89]);
  
  // Dekorativer Header-Bereich
  coverPage.drawRectangle({
    x: 0,
    y: 730,
    width: 595.28,
    height: 111.89,
    color: rgb(0.06, 0.45, 0.55), // Dunkles Teal
  });
  
  coverPage.drawText(title || 'BEWERBUNGS-MAPPE', {
    x: 40,
    y: 770,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  
  const preferences = db.getPreferences();
  
  // Details
  const isPartner = preferences.partnerModeEnabled;
  coverPage.drawText(isPartner ? 'Bewerber-Informationen (Gemeinschaftsbewerbung)' : 'Bewerber-Informationen', {
    x: 40,
    y: 680,
    size: 15,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1)
  });
  
  let currentY = 650;
  if (isPartner) {
    coverPage.drawText(`Partner A: ${preferences.partnerAName || 'Partner A'} (${preferences.candidateEmail || ''})`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    currentY -= 18;
    coverPage.drawText(`Partner B: ${preferences.partnerBName || 'Partner B'}`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
    currentY -= 18;
    if (preferences.candidatePhone) {
      coverPage.drawText(`Telefon: ${preferences.candidatePhone}`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 18;
    }
  } else {
    if (preferences.candidateName) {
      coverPage.drawText(`Name: ${preferences.candidateName}`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 18;
    }
    if (preferences.candidateEmail) {
      coverPage.drawText(`E-Mail: ${preferences.candidateEmail}`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 18;
    }
    if (preferences.candidatePhone) {
      coverPage.drawText(`Telefon: ${preferences.candidatePhone}`, { x: 40, y: currentY, size: 11, font: fontRegular, color: rgb(0.25, 0.25, 0.25) });
      currentY -= 18;
    }
  }
  
  // Bewerberfoto einbetten falls vorhanden
  if (preferences.candidatePhoto) {
    try {
      const photoFilename = preferences.candidatePhoto.replace('/uploads/', '');
      const photoPath = path.join(UPLOADS_DIR, photoFilename);
      
      if (fs.existsSync(photoPath)) {
        const photoBytes = fs.readFileSync(photoPath);
        let photoImage;
        if (photoFilename.toLowerCase().endsWith('.png')) {
          photoImage = await mergedPdf.embedPng(photoBytes);
        } else {
          photoImage = await mergedPdf.embedJpg(photoBytes);
        }
        
        if (photoImage) {
          const photoDims = photoImage.scaleToFit(110, 140);
          coverPage.drawImage(photoImage, {
            x: 440,
            y: 530,
            width: photoDims.width,
            height: photoDims.height,
          });
        }
      }
    } catch (photoErr) {
      console.error('Fehler beim Einbetten des Bewerberfotos:', photoErr.message);
    }
  }
  
  // Trennlinie
  coverPage.drawLine({
    start: { x: 40, y: 480 },
    end: { x: 555, y: 480 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85)
  });
  
  // "Über mich" anzeigen
  coverPage.drawText('Über uns / Profil', {
    x: 40,
    y: 450,
    size: 15,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1)
  });
  
  const aboutText = preferences.aboutMe || 'Keine Beschreibung im Suchprofil hinterlegt.';
  const words = aboutText.split(/\s+/);
  let line = '';
  let lineY = 425;
  const maxWidth = 515;
  
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = fontRegular.widthOfTextAtSize(testLine, 10.5);
    if (testWidth > maxWidth) {
      coverPage.drawText(line, { x: 40, y: lineY, size: 10.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      line = word;
      lineY -= 16;
    } else {
      line = testLine;
    }
    if (lineY < 180) {
      break;
    }
  }
  if (line && lineY >= 140) {
    coverPage.drawText(line, { x: 40, y: lineY, size: 10.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    lineY -= 20;
  }
  
  // Inhaltsverzeichnis
  if (documentIds && documentIds.length > 0) {
    let tocY = lineY - 30;
    if (tocY < 120) tocY = 120;
    
    coverPage.drawText('Anlagenverzeichnis:', {
      x: 40,
      y: tocY,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1)
    });
    
    tocY -= 16;
    const docs = db.getDocuments();
    let docIdx = 1;
    for (const docId of documentIds) {
      const doc = docs.find(d => d.id === docId);
      if (doc) {
        coverPage.drawText(`${docIdx}. ${doc.name}`, {
          x: 50,
          y: tocY,
          size: 10,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4)
        });
        tocY -= 14;
        docIdx++;
      }
    }
  }
  
  // 2. Dokumente einbetten
  if (documentIds && Array.isArray(documentIds)) {
    const docs = db.getDocuments();
    for (const docId of documentIds) {
      const doc = docs.find(d => d.id === docId);
      if (!doc) continue;
      
      const filePath = path.join(UPLOADS_DIR, doc.filename);
      if (!fs.existsSync(filePath)) continue;
      
      const docBytes = fs.readFileSync(filePath);
      
      if (doc.filename.toLowerCase().endsWith('.pdf') || doc.mimetype === 'application/pdf') {
        try {
          const subPdf = await PDFDocument.load(docBytes);
          const copiedPages = await mergedPdf.copyPages(subPdf, subPdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (pdfErr) {
          console.error(`Fehler beim Laden von PDF ${doc.name}:`, pdfErr.message);
        }
      } else if (doc.mimetype.startsWith('image/') || doc.filename.toLowerCase().endsWith('.png') || doc.filename.toLowerCase().endsWith('.jpg') || doc.filename.toLowerCase().endsWith('.jpeg')) {
        try {
          let img;
          if (doc.filename.toLowerCase().endsWith('.png') || doc.mimetype === 'image/png') {
            img = await mergedPdf.embedPng(docBytes);
          } else {
            img = await mergedPdf.embedJpg(docBytes);
          }
          
          if (img) {
            const newPage = mergedPdf.addPage([595.28, 841.89]);
            const fit = img.scaleToFit(515, 761);
            newPage.drawImage(img, {
              x: 40 + (515 - fit.width) / 2,
              y: 40 + (761 - fit.height) / 2,
              width: fit.width,
              height: fit.height
            });
          }
        } catch (imgErr) {
          console.error(`Fehler beim Laden von Bild ${doc.name}:`, imgErr.message);
        }
      }
    }
  }

  // 3. Wasserzeichen anwenden (falls angegeben)
  if (watermarkText) {
    const pages = mergedPdf.getPages();
    for (const page of pages) {
      page.drawText(watermarkText, {
        x: 60,
        y: 400,
        size: 18,
        font: fontBold,
        color: rgb(0.8, 0.1, 0.1),
        opacity: 0.25,
        rotate: degrees(45)
      });
    }
  }
  
  return await mergedPdf.save();
}
