import { guard, logError } from '../_lib/http.js';

export default async function handler(req, res) {
  if (!(await guard(req, res))) return;

  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Kein Suchbegriff übergeben.' });
    }
    if (query.length > 2000) {
      return res.status(400).json({ error: 'Suchbegriff ist zu lang.' });
    }

    const perplexityApiKey = req.headers['x-perplexity-api-key'] || process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return res.status(400).json({ error: 'Perplexity API Key ist nicht konfiguriert.' });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'Du bist ein Fachexperte für Elektrotechnik und VDE-Richtlinien. Beantworte die Frage präzise auf Deutsch. Nutze Markdown-Formatierung.' },
          { role: 'user', content: query }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API Fehler: ${errorText}`);
    }

    const data = await response.json();
    res.json({ answer: data.choices[0].message.content });
  } catch (error) {
    logError(req, 'Fehler bei der Perplexity-Suche', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Suche.' });
  }
}
