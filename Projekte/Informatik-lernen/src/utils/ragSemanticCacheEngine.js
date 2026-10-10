// @ts-check

/**
 * @typedef {Object} SemanticCacheEntry
 * @property {string} id
 * @property {string} prompt
 * @property {number[]} embedding
 * @property {string} response
 * @property {number} tokensSaved
 * @property {number} latencySavedMs
 * @property {number} hits
 */

/**
 * @typedef {Object} QueryEvaluationResult
 * @property {boolean} isHit
 * @property {SemanticCacheEntry | null} matchedEntry
 * @property {number} similarityScore
 * @property {number} latencyMs
 * @property {number} estimatedCostSavedUsd
 * @property {string} executionPath
 */

/**
 * Computes cosine similarity between two numeric vectors.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Value between -1.0 and 1.0 (or 0 if invalid)
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const valA = vecA[i] ?? 0;
    const valB = vecB[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return Math.max(-1, Math.min(1, dotProduct / denominator));
}

/**
 * Deterministic pseudo-embedding generator for demo and educational visualization.
 * Maps words in text into a normalized 8-dimensional semantic space.
 * @param {string} text
 * @returns {number[]} 8-dimensional normalized vector
 */
export function generateDemoEmbedding(text) {
  const clean = (text || '').toLowerCase().trim();
  /** @type {number[]} */
  const dimensions = [0, 0, 0, 0, 0, 0, 0, 0];

  const clusters = [
    { keywords: ['datenbank', 'database', 'sql', 'postgres', 'query', 'tabelle', 'index', 'select'], dim: 0 },
    { keywords: ['netzwerk', 'network', 'ip', 'tcp', 'udp', 'routing', 'dns', 'port', 'subnetz', 'vlan', 'switch', 'router', 'cisco'], dim: 1 },
    { keywords: ['sicherheit', 'security', 'firewall', 'verschluesselung', 'verschlüsselung', 'tls', 'auth', 'passwort', 'hash', 'rsa', 'aes'], dim: 2 },
    { keywords: ['code', 'programmieren', 'funktion', 'react', 'javascript', 'python', 'bug', 'class', 'html', 'css'], dim: 3 },
    { keywords: ['cloud', 'docker', 'kubernetes', 'server', 'linux', 'aws', 'container', 'deploy'], dim: 4 },
    { keywords: ['hardware', 'cpu', 'ram', 'speicher', 'festplatte', 'ssd', 'bios', 'takt'], dim: 5 },
    { keywords: ['wiso', 'projekt', 'kosten', 'vertrag', 'angebot', 'agb', 'kunde', 'rechnung', 'deckungsbeitrag', 'liquiditaet'], dim: 6 },
    { keywords: ['ki', 'ai', 'llm', 'rag', 'embedding', 'vektor', 'prompt', 'transformer'], dim: 7 },
  ];

  let matchedAny = false;
  clusters.forEach(({ keywords, dim }) => {
    keywords.forEach(kw => {
      if (clean.includes(kw)) {
        dimensions[dim] += 3.0;
        matchedAny = true;
      }
    });
  });

  // If no clusters matched, disperse into general dimensions based on hash
  if (!matchedAny) {
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      const targetDim = (code * 31 + i) % 8;
      dimensions[targetDim] += 0.2;
    }
  }

  let sumSq = 0;
  for (let i = 0; i < 8; i++) {
    const val = dimensions[i] ?? 0;
    sumSq += val * val;
  }
  const mag = Math.sqrt(sumSq) || 1;

  return dimensions.map(d => Number((d / mag).toFixed(4)));
}

/**
 * Pre-populated default semantic cache entries for demonstration.
 * @type {SemanticCacheEntry[]}
 */
export const DEFAULT_SEMANTIC_CACHE = [
  {
    id: 'cache-1',
    prompt: 'Wie konfiguriere ich ein VLAN auf einem Cisco Switch?',
    embedding: generateDemoEmbedding('Wie konfiguriere ich ein VLAN auf einem Cisco Switch?'),
    response: '1. configure terminal 2. vlan 10 -> name IT-Abteilung 3. interface Gi0/1 -> switchport mode access -> switchport access vlan 10.',
    tokensSaved: 420,
    latencySavedMs: 1450,
    hits: 14,
  },
  {
    id: 'cache-2',
    prompt: 'Was ist der Unterschied zwischen TCP und UDP?',
    embedding: generateDemoEmbedding('Was ist der Unterschied zwischen TCP und UDP?'),
    response: 'TCP ist verbindungsorientiert mit 3-Way-Handshake, Flow-Control und garantierter Reihenfolge. UDP ist verbindungslos, unbestaetigt und bietet minimale Latenz fuer Streaming/DNS/VoIP.',
    tokensSaved: 380,
    latencySavedMs: 1200,
    hits: 28,
  },
  {
    id: 'cache-3',
    prompt: 'Erklaere den Unterschied zwischen symmetrischer und asymmetrischer Verschluesselung.',
    embedding: generateDemoEmbedding('Erklaere den Unterschied zwischen symmetrischer und asymmetrischer Verschluesselung.'),
    response: 'Symmetrisch (AES) nutzt denselben geheimen Schluessel fuer Ver- und Entschluesselung (sehr schnell). Asymmetrisch (RSA, ECC) nutzt ein Public/Private-Key-Paar fuer Key-Exchange und digitale Signaturen.',
    tokensSaved: 510,
    latencySavedMs: 1680,
    hits: 19,
  },
  {
    id: 'cache-4',
    prompt: 'Wie berechnet man den Deckungsbeitrag in WISO?',
    embedding: generateDemoEmbedding('Wie berechnet man den Deckungsbeitrag in WISO?'),
    response: 'Deckungsbeitrag DB = Umsatzerloese (Netto) - variable Kosten. Der Stueckdeckungsbeitrag ist db = Verkaufspreis - variable Stueckkosten.',
    tokensSaved: 290,
    latencySavedMs: 950,
    hits: 9,
  }
];

/**
 * Evaluates an incoming user query against the Semantic Cache.
 * @param {string} query
 * @param {SemanticCacheEntry[]} cache
 * @param {number} similarityThreshold Cosine threshold (e.g. 0.85)
 * @returns {QueryEvaluationResult}
 */
export function querySemanticCache(query, cache, similarityThreshold = 0.85) {
  if (!query || query.trim().length === 0) {
    return {
      isHit: false,
      matchedEntry: null,
      similarityScore: 0,
      latencyMs: 0,
      estimatedCostSavedUsd: 0,
      executionPath: 'EMPTY_QUERY',
    };
  }

  const queryEmbedding = generateDemoEmbedding(query);

  let bestEntry = null;
  let bestScore = -1;

  for (const entry of cache) {
    const score = calculateCosineSimilarity(queryEmbedding, entry.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  const roundedScore = Number(Math.max(0, bestScore).toFixed(4));
  const isHit = roundedScore >= similarityThreshold && bestEntry !== null;

  if (isHit && bestEntry) {
    const costSaved = (bestEntry.tokensSaved / 1000) * 0.003;
    return {
      isHit: true,
      matchedEntry: bestEntry,
      similarityScore: roundedScore,
      latencyMs: 8,
      estimatedCostSavedUsd: Number(costSaved.toFixed(5)),
      executionPath: `SEMANTIC_CACHE_HIT (Cosine ${roundedScore} >= ${similarityThreshold})`,
    };
  }

  return {
    isHit: false,
    matchedEntry: bestEntry,
    similarityScore: roundedScore,
    latencyMs: 1420,
    estimatedCostSavedUsd: 0,
    executionPath: `LLM_FALLBACK_INFERENCE (Cosine ${roundedScore} < ${similarityThreshold})`,
  };
}
