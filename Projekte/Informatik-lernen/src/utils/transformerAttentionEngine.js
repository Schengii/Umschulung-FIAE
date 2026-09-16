/**
 * Transformer Attention, Softmax & LLM Inference Sampling Engine
 */

export const SAMPLE_SENTENCES = [
  { id: 's1', text: 'Der Server stürzte ab weil er überlastet war' },
  { id: 's2', text: 'The developer deployed a microservice to production' },
  { id: 's3', text: 'Kubernetes steuert die Pods und skaliert automatisch' }
];

/**
 * Computes simulated Scaled Dot-Product Attention weights for token pairs
 */
export function calculateAttentionMatrix(tokens, headSeed = 1) {
  const n = tokens.length;
  const matrix = [];

  // Generate pseudo Query & Key vectors (dimension d_k = 4)
  const d_k = 4;
  const sqrt_dk = Math.sqrt(d_k);

  const vectors = tokens.map((token, idx) => {
    // Generate deterministic embedding vector based on token string hash and index
    const hash = token.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return [
      Math.sin(hash * 0.1 + headSeed + idx),
      Math.cos(hash * 0.2 + headSeed),
      Math.sin(hash * 0.3 + idx * 0.5),
      Math.cos(hash * 0.4 + idx)
    ];
  });

  for (let i = 0; i < n; i++) {
    const rawScores = [];
    for (let j = 0; j < n; j++) {
      // Dot product Q_i * K_j
      let dot = 0;
      for (let k = 0; k < d_k; k++) {
        dot += vectors[i][k] * vectors[j][k];
      }
      // Heuristic boost for semantic links (e.g. 'er' -> 'Server')
      if ((tokens[i].toLowerCase() === 'er' && tokens[j].toLowerCase() === 'server') ||
          (tokens[i].toLowerCase() === 'pods' && tokens[j].toLowerCase() === 'kubernetes')) {
        dot += 2.5;
      }
      rawScores.push(dot / sqrt_dk);
    }

    // Softmax calculation
    const maxScore = Math.max(...rawScores);
    const expScores = rawScores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const softmaxRow = expScores.map(e => Number((e / sumExp).toFixed(3)));

    matrix.push(softmaxRow);
  }

  return matrix;
}

/**
 * Calculates next-token sampling distribution with Temperature, Top-K, Top-P
 */
export function sampleNextTokenDistribution(candidateTokens, temperature = 0.7, topK = 5, topP = 0.9) {
  const temp = Math.max(0.01, temperature);

  // Apply temperature scaling
  const scaledLogits = candidateTokens.map(c => ({
    token: c.token,
    rawLogit: c.logit,
    scaledLogit: c.logit / temp
  }));

  // Softmax
  const maxLogit = Math.max(...scaledLogits.map(s => s.scaledLogit));
  const expLogits = scaledLogits.map(s => Math.exp(s.scaledLogit - maxLogit));
  const sumExp = expLogits.reduce((a, b) => a + b, 0);

  let probs = scaledLogits.map((s, idx) => ({
    token: s.token,
    prob: expLogits[idx] / sumExp
  }));

  // Sort descending
  probs.sort((a, b) => b.prob - a.prob);

  // Apply Top-K
  if (topK > 0 && topK < probs.length) {
    probs = probs.slice(0, topK);
  }

  // Apply Top-P (Nucleus)
  let cumSum = 0;
  const filtered = [];
  for (const item of probs) {
    filtered.push(item);
    cumSum += item.prob;
    if (cumSum >= topP && filtered.length >= 1) break;
  }

  // Renormalize probabilities
  const finalSum = filtered.reduce((a, b) => a + b.prob, 0);
  return filtered.map(item => ({
    token: item.token,
    prob: Number((item.prob / finalSum).toFixed(4)),
    percentage: Number(((item.prob / finalSum) * 100).toFixed(1))
  }));
}

/**
 * ReAct (Reason + Act) Agent Workflow Simulator
 */
export const REACT_AGENT_SAMPLE_RUN = {
  goal: 'Ermittle die freie Speicherkapazität des Datenbank-Clusters und plane Wartungsarbeiten.',
  steps: [
    {
      step: 1,
      type: 'Thought',
      content: 'Ich muss zuerst den aktuellen Disk-Usage Status auf Node-01 und Node-02 über das Monitoring-Tool abfragen.'
    },
    {
      step: 2,
      type: 'Action',
      tool: 'execute_cli_query',
      params: { command: 'df -h /var/lib/postgresql/data' },
      content: 'Führe Shell-Befehl zur Speicherprüfung aus.'
    },
    {
      step: 3,
      type: 'Observation',
      content: 'Node-01: 94% belegt (380GB/400GB) [ALERT: CRITICAL], Node-02 (Replica): 94% belegt.'
    },
    {
      step: 4,
      type: 'Thought',
      content: 'Der Speicherplatz ist über dem 90% Schwellenwert. Es müssen alte WAL-Logs archiviert und ein Autovacuum getriggert werden.'
    },
    {
      step: 5,
      type: 'Action',
      tool: 'trigger_vacuum_archive',
      params: { dryRun: false, targetRetentionDays: 14 },
      content: 'Starte automatische WAL-Archivierung und Bereinigung.'
    },
    {
      step: 6,
      type: 'Observation',
      content: 'Bereinigung erfolgreich: 142 GB Speicherplatz freigegeben. Auslastung sinkt auf 59%.'
    },
    {
      step: 7,
      type: 'FinalAnswer',
      content: 'Der Datenbank-Cluster wurde erfolgreich bereinigt. Der freie Speicher beträgt nun 41% (162 GB frei). Keine Ausfallzeit festgestellt.'
    }
  ]
};
