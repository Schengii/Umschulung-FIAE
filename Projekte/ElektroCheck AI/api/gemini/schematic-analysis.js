import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { checkImage, generateJson, stripImageDataUrl } from '../_lib/gemini-helper.js';
import { schematicAnalysisSchema } from '../_lib/schemas.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { imageBase64, notes } = req.body || {};
    const imageError = checkImage(imageBase64, { missingMessage: 'Kein Schaltplan-Bild übergeben.' });
    if (imageError) return res.status(imageError.status).json({ error: imageError.error });
    const safeNotes = typeof notes === 'string' ? notes.slice(0, 2000) : '';

    const parsed = await generateJson(req, res, {
      systemInstruction: 'Du bist ein erfahrener Meister der Elektrotechnik. Analysiere das Bild dieses Schaltplans oder Stromlaufplans. Identifiziere alle Betriebsmittel (z.B. Q1, K1M, F1, T1), deren Klemmen und erfasse potenzielle Verdrahtungsfehler oder VDE-Normabweichungen (z.B. DIN EN 61082, VDE 0100). Antworte ausschließlich im vorgegebenen JSON-Format.',
      schema: schematicAnalysisSchema,
      parts: [
        { text: `Analysiere folgenden Stromlaufplan/Schaltplan. Zusätzliche Anmerkungen: "${safeNotes || 'Keine Anmerkungen.'}"` },
        { inlineData: { mimeType: 'image/jpeg', data: stripImageDataUrl(imageBase64) } }
      ]
    });
    if (parsed) res.json(parsed);
  } catch (error) {
    logError(req, 'Fehler bei der Schaltplan-Analyse', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Schaltplan-Analyse.' });
  }
}
