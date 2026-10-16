import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { generateContent } from '../_lib/gemini-helper.js';

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 8000;

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { messages, context } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Keine Chat-Nachrichten übergeben.' });
    }
    if (messages.length > MAX_MESSAGES || messages.some(m => typeof m?.content !== 'string' || m.content.length > MAX_MESSAGE_LENGTH)) {
      return res.status(400).json({ error: 'Ungültige oder zu lange Chat-Nachrichten.' });
    }

    const systemPrompt = `Du bist der ElektroCheck AI Reparatur-Co-Pilot für Elektrofachkräfte.
Du hilfst Technikern praxisnah, präzise und sicherheitsbewusst bei der Diagnose, Reparatur und Einhaltung von VDE-Normen (DIN VDE 0100, 0701-0702, DGUV V3).
Beantworte Fragen direkt, verständlich und auf den Punkt. Weise bei Arbeiten unter Spannung immer auf die 5 Sicherheitsregeln hin.
${context ? `\nAktueller Diagnosekontext:\n- Gerät: ${context.deviceName || 'Unbekannt'}\n- Befund: ${context.identifiedDefect || 'Unbekannt'}\n- Empfehlung: ${context.recommendation || 'Keine'}` : ''}`;

    const result = await generateContent(req, {
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      config: { systemInstruction: systemPrompt }
    });
    const reply = (result.text ?? '').trim();
    res.json({ reply });
  } catch (error) {
    logError(req, 'Fehler beim KI-Chat', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Chat-Verarbeitung.' });
  }
}
