import { GoogleGenAI } from '@google/genai';
import Ajv from 'ajv';

// Vercel Functions erlauben max. 4,5 MB Request-Body → Base64-Daten entsprechend begrenzen
export const MAX_IMAGE_BASE64 = 4_000_000;
export const MAX_AUDIO_BASE64 = 4_000_000;

const ajv = new Ajv({ allErrors: true, removeAdditional: true });

export const getModelName = () => process.env.GEMINI_MODEL || 'gemini-2.0-flash';
/** Ausweichmodell, falls das Hauptmodell abgeschaltet (404) oder überlastet (503) ist. Leer/gleich = kein Fallback. */
export const getFallbackModelName = () => process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-1.5-flash';

export function getGenAIInstance(req) {
  const userApiKey = req.headers['x-gemini-api-key'];
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API-Key nicht konfiguriert.');
  }
  return new GoogleGenAI({ apiKey });
}

const isModelUnavailable = (error) => [404, 503].includes(Number(error?.status ?? error?.code));

/**
 * generateContent mit dem konfigurierten Modell; bei 404/503 einmal mit dem Fallback-Modell wiederholen.
 * request = { contents, config } (ohne model).
 */
export async function generateContent(req, request) {
  const ai = getGenAIInstance(req);
  const primary = getModelName();
  try {
    return await ai.models.generateContent({ ...request, model: primary });
  } catch (error) {
    const fallback = getFallbackModelName();
    if (!isModelUnavailable(error) || !fallback || fallback === primary) throw error;
    console.warn(`Gemini-Modell ${primary} nicht verfügbar (${error.status ?? error.code}), nutze ${fallback}.`);
    return ai.models.generateContent({ ...request, model: fallback });
  }
}

export const stripImageDataUrl = (value) => value.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

/** Prüft ein Bild-Feld; liefert { status, error } bei Fehler, sonst null. */
export function checkImage(imageBase64, { required = true, missingMessage = 'Kein Bild empfangen.' } = {}) {
  if (!imageBase64) {
    return required ? { status: 400, error: missingMessage } : null;
  }
  if (typeof imageBase64 !== 'string') return { status: 400, error: 'Ungültiges Bildformat.' };
  if (imageBase64.length > MAX_IMAGE_BASE64) return { status: 413, error: 'Bild ist zu groß.' };
  return null;
}

/**
 * Strukturierte Gemini-Anfrage (JSON-Schema) inkl. Parsen und optionaler Schema-Validierung.
 * Sendet bei Fehlern direkt die passende Antwort und liefert dann null zurück.
 */
export async function generateJson(req, res, { systemInstruction, schema, parts, validate = false }) {
  const result = await generateContent(req, {
    contents: [{ role: 'user', parts }],
    config: { systemInstruction, responseMimeType: 'application/json', responseJsonSchema: schema }
  });
  const text = (result.text ?? '').trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    res.status(502).json({ error: 'Ungültige Antwort vom KI-Dienst.' });
    return null;
  }

  if (validate) {
    const check = ajv.compile(schema);
    if (!check(parsed)) {
      res.status(502).json({ error: 'Antwort erfüllte nicht das erwartete Schema.', details: check.errors, raw: parsed });
      return null;
    }
  }
  return parsed;
}
