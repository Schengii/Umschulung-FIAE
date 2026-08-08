import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Ajv from 'ajv';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import helmet from 'helmet';
import pino from 'pino';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ticketsFilePath = path.join(__dirname, 'data', 'tickets.json');

dotenv.config(); // Lädt Umgebungsvariablen aus .env

const app = express();
const port = process.env.PORT || 3000; // Port für den Backend-Server

// Sicherheit: HTTP-Header härten (vor anderen Middlewares)
app.use(helmet());

// Logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Request-ID Middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Math.random().toString(36).substring(2, 11)}`;
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  req.log = logger.child({ requestId });
  req.log.info({ method: req.method, url: req.url }, 'Request received');
  next();
});

// Rate limiting: benutze RedisStore falls REDIS_URL gesetzt ist, sonst InMemory.
let apiLimiter;
if (process.env.REDIS_URL) {
  try {
    const redisClient = new Redis(process.env.REDIS_URL);
    apiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 60, // 60 Anfragen pro Minute
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({ client: redisClient })
    });
    logger.info('Rate-Limiter mit Redis-Store aktiviert.');
  } catch (e) {
    logger.error('Fehler beim Initialisieren des Redis-Rate-Limiters, Fallback auf InMemory.', e);
    apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }); // 30 Anfragen pro Minute als Fallback
  }
} else {
  apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
}
app.use('/api/', apiLimiter);

// JSON Schema Validator
const ajv = new Ajv({ allErrors: true, removeAdditional: true });
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' // Ersetze dies mit der tatsächlichen URL deiner Frontend-App im Produktionsmodus
}));
app.use(express.json({ limit: '50mb' })); // Erhöht das Limit für JSON-Payloads, um Base64-Bilder zu verarbeiten

// Gemini API Key aus Umgebungsvariablen laden
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (GEMINI_API_KEY) {
  logger.info('GEMINI_API_KEY wurde erfolgreich geladen.');
} else if (process.env.NODE_ENV !== 'test') {
  logger.error('GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt!');
  process.exit(1);
} else {
  logger.warn('GEMINI_API_KEY nicht gesetzt (Testmodus erlaubt).');
}

const getGenAIInstance = (req) => {
  const userApiKey = req.headers['x-gemini-api-key'];
  const apiKey = userApiKey || GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API-Key nicht konfiguriert.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// JSON-Schema für Fehlerdiagnose
const diagnosisSchema = {
  type: "object",
  properties: {
    deviceName: {
      type: "string",
      description: "Name des Geräts oder Bauteils"
    },
    identifiedDefect: {
      type: "string",
      description: "Kurze, präzise Beschreibung des Defekts"
    },
    recommendation: {
      type: "string",
      description: "Zusammenfassung der vorgeschlagenen Lösung"
    },
    actionSteps: {
      type: "array",
      description: "Schritt-für-Schritt-Anleitungen für die Reparatur, nummeriert und mit completed als false",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          text: { type: "string" },
          completed: { type: "boolean" }
        },
        required: ["id", "text", "completed"]
      }
    },
    estimatedRepairCost: {
      type: "string",
      description: "Geschätzte Kosten für die Reparatur"
    },
    repairDifficulty: {
      type: "integer",
      description: "Schwierigkeitsgrad von 1 (sehr leicht) bis 5 (Experte)"
    },
    safetyLevel: {
      type: "string",
      enum: ["SAFE", "WARNING", "DANGER"],
      description: "Sicherheitsstufe basierend auf Gefahrenpotential"
    },
    additionalTips: {
      type: "array",
      items: { type: "string" },
      description: "1-3 kurze Tipps zur Vermeidung oder Pflege"
    },
    sparePartSearchTerm: {
      type: "string",
      description: "Exakter Suchbegriff für benötigte Ersatzteile"
    },
    customerExperience: {
      type: "string",
      description: "Erfahrungswerte: Ist dies ein typischer Verschleißfehler?"
    },
    boundingBoxes: {
      type: "array",
      description: "Markierungen von identifizierten Defekten, Schäden oder Bauteilen auf dem Bild. Wenn kein Bild vorliegt oder nichts markiert werden kann, leeres Array zurückgeben.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Bezeichnung des Bereichs, z.B. 'Beschädigte Isolierung' oder 'Aufgequollener Kondensator'" },
          box_2d: {
            type: "array",
            description: "4 Ganzzahlen [ymin, xmin, ymax, xmax] normiert auf 0 bis 1000 relativ zum Bild",
            items: { type: "integer" }
          }
        },
        required: ["label", "box_2d"]
      }
    }
  },
  required: [
    "deviceName",
    "identifiedDefect",
    "recommendation",
    "actionSteps",
    "estimatedRepairCost",
    "repairDifficulty",
    "safetyLevel",
    "additionalTips",
    "sparePartSearchTerm",
    "customerExperience",
    "boundingBoxes"
  ]
};

// JSON-Schema für Typenschild OCR
const scanSchema = {
  type: "object",
  properties: {
    componentName: {
      type: "string",
      description: "Identifiziertes Bauteil oder Gerät"
    },
    extractedText: {
      type: "string",
      description: "Alle wichtigen Werte, Seriennummern und Spezifikationen vom Typenschild"
    },
    datasheetSearchUrl: {
      type: "string",
      description: "Eine Google-Such-URL zum Auffinden des Datenblatts"
    }
  },
  required: ["componentName", "extractedText", "datasheetSearchUrl"]
};

// JSON-Schema für Wärmebild-Analyse
const thermalAnalysisSchema = {
  type: "object",
  properties: {
    overallStatus: {
      type: "string",
      enum: ["SAFE", "MONITOR", "CRITICAL"],
      description: "Gesamtsicherheitsstatus der thermografischen Untersuchung"
    },
    generalRecommendation: {
      type: "string",
      description: "Zusammenfassung der Erkenntnisse und dringende Maßnahmen auf Deutsch"
    },
    detectedHotspots: {
      type: "array",
      description: "Liste der erkannten Wärmeanomalien und Hotspots auf dem Bild.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Bezeichnung des Bauteils oder Bereichs, z.B. 'Zuleitung Klemme L1' oder 'Sicherung F2'" },
          temperature: { type: "string", description: "Geschätzte Temperatur des Hotspots (z.B. '85°C')" },
          severity: { type: "string", enum: ["OK", "MONITOR", "CRITICAL"], description: "Kritikalität des Hotspots" },
          box_2d: {
            type: "array",
            description: "4 Ganzzahlen [ymin, xmin, ymax, xmax] normiert auf 0 bis 1000 relativ zum Bild für den markierten Hotspot",
            items: { type: "integer" }
          }
        },
        required: ["label", "temperature", "severity", "box_2d"]
      }
    },
    actionSteps: {
      type: "array",
      description: "Nummerierte Schritt-für-Schritt-Anleitung zur Behebung der thermischen Probleme auf Deutsch.",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          text: { type: "string" },
          completed: { type: "boolean" }
        },
        required: ["id", "text", "completed"]
      }
    },
    safetyTips: {
      type: "array",
      items: { type: "string" },
      description: "1-3 VDE-konforme Sicherheitshinweise zur Thermografie (z.B. Grenztemperaturen nach DIN EN 60204-1) auf Deutsch."
    }
  },
  required: ["overallStatus", "generalRecommendation", "detectedHotspots", "actionSteps", "safetyTips"]
};

// JSON-Schema für Multimeter OCR
const multimeterSchema = {
  type: "object",
  properties: {
    value: {
      type: "number",
      description: "Der gelesene Messwert als Dezimalzahl (z.B. 0.23, 230.5). Wenn kein gültiger Zahlenwert erkannt wird, liefere null."
    },
    unit: {
      type: "string",
      enum: ["V", "mA", "A", "Ohm", "kOhm", "MOhm", "UNKNOWN"],
      description: "Die physikalische Einheit auf dem Display des Multimeters."
    }
  },
  required: ["value", "unit"]
};

// JSON-Schema für Schaltplan- & Stromlaufplan-Analyse
const schematicAnalysisSchema = {
  type: "object",
  properties: {
    diagramTitle: {
      type: "string",
      description: "Titel oder Typ des Schaltplans (z.B. 'Wendeschützsteuerung', 'Stern-Dreieck-Schaltung', 'Verteilerplan')"
    },
    identifiedComponents: {
      type: "array",
      description: "Liste aller identifizierten Bauteile im Schaltplan mit Klemmen und Kennzeichnung",
      items: {
        type: "object",
        properties: {
          tag: { type: "string", description: "Betriebsmittelkennzeichnung z.B. 'Q1', 'K1M', 'F1'" },
          name: { type: "string", description: "Bezeichnung z.B. 'Leitungsschutzschalter 16A', 'Hauptschütz'" },
          terminals: { type: "string", description: "Identifizierte Klemmen z.B. '1, 3, 5 / 2, 4, 6'" }
        },
        required: ["tag", "name", "terminals"]
      }
    },
    detectedErrors: {
      type: "array",
      description: "Erkannte Verdrahtungsfehler, fehlende PE-Leiter, Kurzschlussrisiken oder Normabweichungen nach DIN EN 61082 / VDE 0100",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["INFO", "WARNING", "CRITICAL"] },
          description: { type: "string", description: "Detaillierte Beschreibung der Auffälligkeit" },
          vdeReference: { type: "string", description: "Referenzierte VDE-Norm z.B. 'DIN VDE 0100-410'" }
        },
        required: ["severity", "description", "vdeReference"]
      }
    },
    summary: {
      type: "string",
      description: "Zusammenfassung der Schaltplanprüfung auf Deutsch"
    }
  },
  required: ["diagramTitle", "identifiedComponents", "detectedErrors", "summary"]
};


// Endpoint für die KI-Diagnose
app.post('/api/gemini/diagnosis', async (req, res) => {
  try {
    // Grundlegende Input-Validierung / Sanitization
    const { imageBase64, description } = req.body || {};
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Ungültiges description-Feld.' });
    }
    const safeDescription = (description || '').toString().slice(0, 2000);

    if (imageBase64 && typeof imageBase64 === 'string') {
      // einfache Größenbegrenzung: ~6MB Base64
      if (imageBase64.length > 6_000_000) {
        return res.status(413).json({ error: 'Bild ist zu groß.' });
      }
    }

    const genAI = getGenAIInstance(req);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'Du bist ein erfahrener Elektroniker für Betriebstechnik. Analysiere das Problem basierend auf den verfügbaren Daten. Sollte ein Bild vorhanden sein, erkenne defekte oder relevante Bauteile/Schadstellen und gib deren Bounding Boxes an (normiert auf 0 bis 1000 im Format [ymin, xmin, ymax, xmax]). Antworte ausschließlich im vorgegebenen JSON-Format.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema
      }
    });

    const parts = [];
    parts.push({
      text: `Zusätzliche Fehlerbeschreibung des Nutzers: "${safeDescription || 'Keine Angaben gemacht.'}" ${imageBase64 ? 'Ein Bild des defekten Geräts wurde beigefügt. Analysiere das Bild und liefere Bounding-Boxes für auffällige Defekte, Beschädigungen oder markierte Bauteile.' : 'Es wurde KEIN Bild beigefügt. Stütze deine Diagnose ausschließlich auf die Textbeschreibung. Lass das boundingBoxes-Feld leer.'}`
    });

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().trim();

    // Optional: JSON-Schema-Validation bevor wir die Antwort durchreichen
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Ungültiges JSON von Gemini:', e);
      return res.status(502).json({ error: 'Ungültige Antwort vom KI-Dienst.' });
    }

    const validate = ajv.compile(diagnosisSchema);
    const valid = validate(parsed);
    if (!valid) {
      console.warn('Schema-Validation failed:', validate.errors);
      // trotzdem die rohe Antwort zurückgeben mit Warnung
      return res.status(502).json({ error: 'Antwort erfüllte nicht das erwartete Schema.', details: validate.errors, raw: parsed });
    }

    res.json(parsed);

  } catch (error) {
    req.log.error('Fehler bei der Gemini API Anfrage im Backend:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Diagnoseanfrage.' });
  }
});

// Endpoint für den Typenschild-Scan
app.post('/api/gemini/scanTypePlate', async (req, res) => {
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Kein Bild empfangen.' });
    }

    if (imageBase64.length > 6_000_000) {
      return res.status(413).json({ error: 'Bild ist zu groß.' });
    }

    const genAI = getGenAIInstance(req);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'Du bist ein Assistent für Elektrofachkräfte. Analysiere dieses Bild eines elektronischen Bauteils oder Typenschilds. Lies alle sichtbaren Texte, Seriennummern und Spezifikationen ab. Gib die Antwort strikt als JSON zurück.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: scanSchema
      }
    });

    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const parts = [
      { text: 'Lies das Typenschild auf dem folgenden Bild aus.' },
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const rawText = response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      req.log.error({ error: e, rawText }, 'Ungültiges JSON von Gemini (scanTypePlate)');
      return res.status(502).json({ error: 'Ungültige Antwort vom KI-Dienst.' });
    }

    const validate = ajv.compile(scanSchema);
    const valid = validate(parsed);
    if (!valid) {
      console.warn('Schema-Validation failed (scanTypePlate):', validate.errors);
      return res.status(502).json({ error: 'Antwort erfüllte nicht das erwartete Schema.', details: validate.errors, raw: parsed });
    }

    res.json(parsed);

  } catch (error) {
    req.log.error('Fehler bei der Typenschild-Scan-Anfrage im Backend:', error);
    res.status(500).json({ error: error.message || 'Fehler beim Scannen des Typenschilds.' });
  }
});

// Endpoint für Audio-Transkription
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64 } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Keine Audio-Daten empfangen." });
    }
    const genAI = getGenAIInstance(req);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const base64Data = audioBase64.replace(/^data:audio\/(webm|wav|ogg|mp4|m4a|mp3|3gpp);base64,/, "");

    const parts = [
      {
        inlineData: {
          mimeType: "audio/webm",
          data: base64Data
        }
      },
      { text: "Transkribiere das gesprochene Wort präzise in deutscher Sprache. Gib AUSSCHLIESSLICH den transkribierten Text zurück, ohne Kommentare, Metadaten oder Einleitungen." }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().trim();

    res.json({ text });

  } catch (error) {
    req.log.error('Fehler bei der Audio-Transkription im Backend:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Transkription.' });
  }
});

// Endpoint für die Wärmebild-Analyse
app.post('/api/gemini/thermal-analysis', async (req, res) => {
  try {
    const { imageBase64, description } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Kein Bild zur Wärmebild-Analyse übergeben." });
    }
    const genAI = getGenAIInstance(req);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "Du bist ein zertifizierter Thermograf und Elektrofachkraft. Analysiere das Infrarot-/Wärmebild eines elektrischen Systems (z.B. Schaltschrank). Identifiziere Hotspots, schätze deren Temperaturen anhand der Falschfarben (gelb/weiß/rot für heiß, blau/lila für kalt) und ordne sie elektrischen Bauteilen zu. Bewerte den Zustand nach VDE-Richtlinien und gib konkrete Handlungsempfehlungen. Antworte ausschließlich im vorgegebenen JSON-Format.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: thermalAnalysisSchema
      }
    });

    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
    const parts = [
      {
        text: `
          Fehlerbeschreibung / Anlagenkontext: "${description || "Keine zusätzlichen Angaben gemacht."}"
          Analysiere das beigefügte Infrarotbild. Finde alle überhitzten Kontakte, Sicherungen, Schütze oder Leitungen. Markiere sie mit Bounding-Boxes (normiert auf 0 bis 1000 im Format [ymin, xmin, ymax, xmax]) und schätze deren Temperatur.
        `,
      },
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().trim();

    try {
      res.json(JSON.parse(text));
    } catch (e) {
      req.log.error({ error: e, rawText: text }, 'Ungültiges JSON von Gemini (thermal-analysis)');
      res.status(502).json({ error: 'Ungültige JSON-Antwort vom KI-Dienst erhalten.' });
    }

  } catch (error) {
    req.log.error("Fehler bei der Gemini API Wärmebild-Anfrage im Backend:", error);
    res.status(500).json({ error: error.message || "Fehler bei der thermografischen Analyse." });
  }
});

// Endpoint für Multimeter-OCR
app.post('/api/gemini/scanMultimeter', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Kein Bild zur Multimeter-Analyse übergeben." });
    }
    const genAI = getGenAIInstance(req);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "Du bist eine Elektrofachkraft. Analysiere das Bild eines Multimeter-Displays. Lies den angezeigten Messwert präzise ab (Dezimalwert) und erkenne die physikalische Einheit (z.B. V, mA, A, Ohm, kOhm, MOhm). Antworte ausschließlich im vorgegebenen JSON-Format.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: multimeterSchema
      }
    });

    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
    const parts = [
      { text: "Lies den Messwert und die Einheit von diesem Multimeter ab." },
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().trim();

    try {
      res.json(JSON.parse(text));
    } catch (e) {
      req.log.error({ error: e, rawText: text }, 'Ungültiges JSON von Gemini (scanMultimeter)');
      res.status(502).json({ error: 'Ungültige JSON-Antwort vom KI-Dienst erhalten.' });
    }

  } catch (error) {
    req.log.error("Fehler bei der Multimeter-Scan-Anfrage im Backend:", error);
    res.status(500).json({ error: error.message || "Fehler beim Lesen des Multimeters." });
  }
});

// Endpoint für Schaltplan- & Stromlaufplan-Analyse
app.post('/api/gemini/schematic-analysis', async (req, res) => {
  try {
    const { imageBase64, notes } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Kein Schaltplan-Bild übergeben.' });
    }

    if (imageBase64.length > 8_000_000) {
      return res.status(413).json({ error: 'Bild ist zu groß.' });
    }

    const genAI = getGenAIInstance(req);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'Du bist ein erfahrener Meister der Elektrotechnik. Analysiere das Bild dieses Schaltplans oder Stromlaufplans. Identifiziere alle Betriebsmittel (z.B. Q1, K1M, F1, T1), deren Klemmen und erfasse potenzielle Verdrahtungsfehler oder VDE-Normabweichungen (z.B. DIN EN 61082, VDE 0100). Antworte ausschließlich im vorgegebenen JSON-Format.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schematicAnalysisSchema
      }
    });

    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const parts = [
      { text: `Analysiere folgenden Stromlaufplan/Schaltplan. Zusätzliche Anmerkungen: "${notes || 'Keine Anmerkungen.'}"` },
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    const rawText = response.text().trim();

    try {
      res.json(JSON.parse(rawText));
    } catch (e) {
      req.log.error({ error: e, rawText }, 'Ungültiges JSON von Gemini (schematic-analysis)');
      res.status(502).json({ error: 'Ungültige Antwort vom KI-Dienst erhalten.' });
    }

  } catch (error) {
    req.log.error('Fehler bei der Schaltplan-Analyse im Backend:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Schaltplan-Analyse.' });
  }
});


// Endpoint für Perplexity-Suche
app.post('/api/perplexity/search', async (req, res) => {
  try {
    const { query } = req.body;
    const userApiKey = req.headers['x-perplexity-api-key'];
    const perplexityApiKey = userApiKey || process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return res.status(400).json({ error: "Perplexity API Key ist nicht konfiguriert." });
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "Du bist ein Fachexperte für Elektrotechnik und VDE-Richtlinien. Beantworte die Frage präzise auf Deutsch. Nutze Markdown-Formatierung." },
          { role: "user", content: query }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API Fehler: ${errorText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;
    res.json({ answer });

  } catch (error) {
    req.log.error('Fehler bei der Perplexity-Suche im Backend:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Suche.' });
  }
});

// Helper Funktionen für die Tickets-Datenbank
const readTickets = () => {
  try {
    if (!fs.existsSync(ticketsFilePath)) {
      fs.mkdirSync(path.dirname(ticketsFilePath), { recursive: true });
      fs.writeFileSync(ticketsFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(ticketsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Fehler beim Lesen der Tickets:', err);
    return [];
  }
};

const writeTickets = (tickets) => {
  try {
    fs.mkdirSync(path.dirname(ticketsFilePath), { recursive: true });
    fs.writeFileSync(ticketsFilePath, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (err) {
    console.error('Fehler beim Schreiben der Tickets:', err);
  }
};

// Tickets-Routen
app.get('/api/tickets', (req, res) => {
  const tickets = readTickets();
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  try {
    const ticket = req.body;
    if (!ticket) {
      return res.status(400).json({ error: 'Keine Ticketdaten übergeben.' });
    }
    const tickets = readTickets();
    const newTicket = {
      id: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      ...ticket
    };
    tickets.push(newTicket);
    writeTickets(tickets);
    req.log.info({ ticketId: newTicket.id }, 'Ticket erfolgreich angelegt');
    res.status(201).json(newTicket);
  } catch (error) {
    req.log.error('Fehler beim Anlegen eines Tickets:', error);
    res.status(500).json({ error: 'Interner Serverfehler beim Erstellen des Tickets.' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Backend-Proxy läuft auf http://localhost:${port}`);
  });
}

export default app;
