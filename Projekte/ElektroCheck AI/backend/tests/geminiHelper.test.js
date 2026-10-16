import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

const generateContentMock = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor(options) {
      this.options = options;
      this.models = { generateContent: generateContentMock };
    }
  }
}));

const { default: app } = await import('../index.js');
const { generateContent } = await import('../../api/_lib/gemini-helper.js');

const req = { headers: { 'x-gemini-api-key': 'test-key' } };
const unavailable = (status) => Object.assign(new Error('model gone'), { status });

describe('Gemini-Helper (@google/genai)', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', '');
    delete process.env.GEMINI_FALLBACK_MODEL;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('nutzt standardmäßig gemini-2.0-flash', async () => {
    generateContentMock.mockResolvedValue({ text: 'ok' });
    await generateContent(req, { contents: [] });
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-2.0-flash' }));
  });

  it('nutzt GEMINI_MODEL, wenn gesetzt', async () => {
    vi.stubEnv('GEMINI_MODEL', 'gemini-test');
    generateContentMock.mockResolvedValue({ text: 'ok' });
    await generateContent(req, { contents: [] });
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-test' }));
  });

  it.each([404, 503])('wechselt bei Status %i auf das Fallback-Modell', async (status) => {
    generateContentMock.mockRejectedValueOnce(unavailable(status)).mockResolvedValueOnce({ text: 'ok' });
    const result = await generateContent(req, { contents: [] });
    expect(result.text).toBe('ok');
    expect(generateContentMock.mock.calls.map((c) => c[0].model)).toEqual(['gemini-2.0-flash', 'gemini-1.5-flash']);
  });

  it('wiederholt nicht bei anderen Fehlern (z. B. 400)', async () => {
    generateContentMock.mockRejectedValue(unavailable(400));
    await expect(generateContent(req, { contents: [] })).rejects.toThrow('model gone');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('leeres GEMINI_FALLBACK_MODEL schaltet den Fallback ab', async () => {
    vi.stubEnv('GEMINI_FALLBACK_MODEL', '');
    generateContentMock.mockRejectedValue(unavailable(404));
    await expect(generateContent(req, { contents: [] })).rejects.toThrow('model gone');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });
});

describe('Gemini-Endpunkte mit gemocktem SDK', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('chat: sendet den gesamten Verlauf und liefert die Antwort', async () => {
    generateContentMock.mockResolvedValue({ text: ' Hallo Techniker ' });
    const res = await request(app).post('/api/gemini/chat').send({
      messages: [
        { role: 'user', content: 'Frage 1' },
        { role: 'assistant', content: 'Antwort 1' },
        { role: 'user', content: 'Frage 2' }
      ]
    });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Hallo Techniker');
    const call = generateContentMock.mock.calls[0][0];
    expect(call.contents.map((c) => c.role)).toEqual(['user', 'model', 'user']);
    expect(call.config.systemInstruction).toContain('Reparatur-Co-Pilot');
  });

  it('transcribe: liefert den Text', async () => {
    generateContentMock.mockResolvedValue({ text: 'Sicherung defekt' });
    const res = await request(app).post('/api/gemini/transcribe').send({ audioBase64: 'data:audio/webm;base64,AAAA' });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Sicherung defekt');
    expect(generateContentMock.mock.calls[0][0].contents[0].parts[0].inlineData.mimeType).toBe('audio/webm');
  });

  it('diagnosis: gibt gültiges JSON weiter und nutzt responseJsonSchema', async () => {
    const diagnosis = {
      deviceName: 'Bohrmaschine', identifiedDefect: 'Kabelbruch', recommendation: 'Kabel tauschen',
      actionSteps: [{ id: 1, text: 'Netzstecker ziehen', completed: false }],
      estimatedRepairCost: '20 €', repairDifficulty: 2, safetyLevel: 'WARNING',
      additionalTips: ['Kabel prüfen'], sparePartSearchTerm: 'Netzkabel', customerExperience: 'Typischer Verschleiß', boundingBoxes: []
    };
    generateContentMock.mockResolvedValue({ text: JSON.stringify(diagnosis) });
    const res = await request(app).post('/api/gemini/diagnosis').send({ description: 'Kabel wackelt' });
    expect(res.status).toBe(200);
    expect(res.body.deviceName).toBe('Bohrmaschine');
    const config = generateContentMock.mock.calls[0][0].config;
    expect(config.responseMimeType).toBe('application/json');
    expect(config.responseJsonSchema).toBeTruthy();
  });

  it('diagnosis: ungültiges JSON der KI ergibt 502', async () => {
    generateContentMock.mockResolvedValue({ text: 'kein json' });
    const res = await request(app).post('/api/gemini/diagnosis').send({ description: 'x' });
    expect(res.status).toBe(502);
  });
});
