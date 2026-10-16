import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { MAX_AUDIO_BASE64, generateContent } from '../_lib/gemini-helper.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { audioBase64 } = req.body || {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Keine Audio-Daten empfangen.' });
    }
    if (audioBase64.length > MAX_AUDIO_BASE64) {
      return res.status(413).json({ error: 'Audio-Datei ist zu groß.' });
    }

    const mimeMatch = audioBase64.match(/^data:(audio\/[a-zA-Z0-9+.-]+);base64,/);
    const audioMimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
    const base64Data = audioBase64.replace(/^data:audio\/[a-zA-Z0-9+.-]+;base64,/, '');

    const result = await generateContent(req, { contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: audioMimeType, data: base64Data } },
      { text: 'Transkribiere das gesprochene Wort präzise in deutscher Sprache. Gib AUSSCHLIESSLICH den transkribierten Text zurück, ohne Kommentare, Metadaten oder Einleitungen.' }
    ] }] });
    const text = (result.text ?? '').trim();
    res.json({ text });
  } catch (error) {
    logError(req, 'Fehler bei der Audio-Transkription', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Transkription.' });
  }
}
