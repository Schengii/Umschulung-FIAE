import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { checkImage, generateJson, stripImageDataUrl } from '../_lib/gemini-helper.js';
import { multimeterSchema } from '../_lib/schemas.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { imageBase64 } = req.body || {};
    const imageError = checkImage(imageBase64, { missingMessage: 'Kein Bild zur Multimeter-Analyse übergeben.' });
    if (imageError) return res.status(imageError.status).json({ error: imageError.error });

    const parsed = await generateJson(req, res, {
      systemInstruction: 'Du bist eine Elektrofachkraft. Analysiere das Bild eines Multimeter-Displays. Lies den angezeigten Messwert präzise ab (Dezimalwert) und erkenne die physikalische Einheit (z.B. V, mA, A, Ohm, kOhm, MOhm). Antworte ausschließlich im vorgegebenen JSON-Format.',
      schema: multimeterSchema,
      parts: [
        { text: 'Lies den Messwert und die Einheit von diesem Multimeter ab.' },
        { inlineData: { data: stripImageDataUrl(imageBase64), mimeType: 'image/jpeg' } }
      ]
    });
    if (parsed) res.json(parsed);
  } catch (error) {
    logError(req, 'Fehler bei der Multimeter-Analyse', error);
    res.status(500).json({ error: error.message || 'Fehler beim Lesen des Multimeters.' });
  }
}
