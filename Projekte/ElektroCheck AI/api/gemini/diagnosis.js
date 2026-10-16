import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { checkImage, generateJson, stripImageDataUrl } from '../_lib/gemini-helper.js';
import { diagnosisSchema } from '../_lib/schemas.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { imageBase64, description } = req.body || {};
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Ungültiges description-Feld.' });
    }
    const safeDescription = (description || '').toString().slice(0, 2000);

    const imageError = checkImage(imageBase64, { required: false });
    if (imageError) return res.status(imageError.status).json({ error: imageError.error });

    const parts = [{
      text: `Zusätzliche Fehlerbeschreibung des Nutzers: "${safeDescription || 'Keine Angaben gemacht.'}" ${imageBase64 ? 'Ein Bild des defekten Geräts wurde beigefügt. Analysiere das Bild und liefere Bounding-Boxes für auffällige Defekte, Beschädigungen oder markierte Bauteile.' : 'Es wurde KEIN Bild beigefügt. Stütze deine Diagnose ausschließlich auf die Textbeschreibung. Lass das boundingBoxes-Feld leer.'}`
    }];
    if (imageBase64) {
      parts.push({ inlineData: { data: stripImageDataUrl(imageBase64), mimeType: 'image/jpeg' } });
    }

    const parsed = await generateJson(req, res, {
      systemInstruction: 'Du bist ein erfahrener Elektroniker für Betriebstechnik. Analysiere das Problem basierend auf den verfügbaren Daten. Sollte ein Bild vorhanden sein, erkenne defekte oder relevante Bauteile/Schadstellen und gib deren Bounding Boxes an (normiert auf 0 bis 1000 im Format [ymin, xmin, ymax, xmax]). Antworte ausschließlich im vorgegebenen JSON-Format.',
      schema: diagnosisSchema,
      parts,
      validate: true
    });
    if (parsed) res.json(parsed);
  } catch (error) {
    logError(req, 'Fehler bei der Gemini API Anfrage (diagnosis)', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Diagnoseanfrage.' });
  }
}
