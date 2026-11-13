// @ts-check
/**
 * Fachlogik-Engine für das Docker & Containerization Lab.
 * Validiert Dockerfiles, analysiert Layer-Caching, prüft Compose-Topologien
 * und liefert IHK-relevante Prüfungs-Drill-Aufgaben.
 */

/**
 * Validiert ein Dockerfile und analysiert Best Practices, Schichten & Sicherheit.
 * @param {string} content
 */
export function validateDockerfile(content) {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  /** @type {string[]} */
  const issues = [];
  /** @type {Array<{ instruction: string, rest: string, lineNumber: number, cached?: boolean }>} */
  const layers = [];
  let hasFrom = false;
  let hasCmdOrEntry = false;
  let isMultiStage = false;
  let stageCount = 0;

  if (lines.length === 0) {
    return {
      isValid: false,
      issues: ['Dockerfile ist leer.'],
      layers: [],
      isMultiStage: false,
      score: 0
    };
  }

  // Erste Direktive muss FROM sein (oder ARG davor)
  const firstNonArg = lines.find((l) => !l.startsWith('ARG'));
  if (!firstNonArg || !firstNonArg.startsWith('FROM')) {
    issues.push('Ein Dockerfile muss mit der FROM-Instruktion beginnen (oder ARG für Versionierung).');
  }

  lines.forEach((line, idx) => {
    const parts = line.split(/\s+/);
    const instruction = parts[0].toUpperCase();
    const rest = line.substring(instruction.length).trim();

    layers.push({ instruction, rest, lineNumber: idx + 1 });

    if (instruction === 'FROM') {
      hasFrom = true;
      stageCount++;
      if (/AS\s+\w+/i.test(rest)) {
        isMultiStage = true;
      }
      if (rest.endsWith(':latest')) {
        issues.push(`Zeile ${idx + 1}: Unspezifischer ':latest' Tag führt zu nicht-deterministischen Builds. Spezifische Version pinnen.`);
      }
    } else if (instruction === 'CMD' || instruction === 'ENTRYPOINT') {
      hasCmdOrEntry = true;
      if (!rest.startsWith('[') || !rest.endsWith(']')) {
        issues.push(`Zeile ${idx + 1}: Exec-Form (JSON-Array) wie CMD ["executable", "param"] wird gegenüber Shell-Form empfohlen.`);
      }
    } else if (instruction === 'ENV') {
      if (/password|secret|key|token/i.test(rest)) {
        issues.push(`Zeile ${idx + 1}: Potenzielle Zugangsdaten (Passwörter/Tokens) sollten nicht via ENV im Image verewigt werden.`);
      }
    } else if (instruction === 'RUN') {
      if (/apt-get\s+install/i.test(rest) && !rest.includes('/var/lib/apt/lists')) {
        issues.push(`Zeile ${idx + 1}: Bei apt-get install sollte der Cache mit 'rm -rf /var/lib/apt/lists/*' im selben RUN-Befehl bereinigt werden.`);
      }
    } else if (instruction === 'COPY') {
      if (/--from=/i.test(rest)) {
        isMultiStage = true;
      }
    }
  });

  if (!hasFrom) {
    issues.push('Fehlende FROM-Anweisung für das Basis-Image.');
  }
  if (!hasCmdOrEntry) {
    issues.push('Kein Standard-Startbefehl definiert (CMD oder ENTRYPOINT fehlt).');
  }

  const isValid = issues.length === 0;
  const score = Math.max(0, 100 - issues.length * 20);

  return {
    isValid,
    issues,
    layers,
    isMultiStage: isMultiStage || stageCount > 1,
    stageCount,
    score
  };
}

/**
 * Simuliert das Schichten-Caching von Docker beim Build.
 * @param {Array<{ instruction: string, rest: string }>} layers
 * @param {'none' | 'package_json' | 'source_code'} changedArtifact
 */
export function simulateBuildCaching(layers, changedArtifact) {
  let cacheInvalidated = false;
  return layers.map((layer) => {
    // Wenn Cache bereits ungültig ist, muss dieser Schritt neu gebaut werden
    if (cacheInvalidated) {
      return { ...layer, cached: false, reason: 'Vorherige Schicht hat Cache invalidiert.' };
    }

    if (changedArtifact === 'none') {
      return { ...layer, cached: true, reason: 'Unverändert (CACHED)' };
    }

    if (changedArtifact === 'source_code') {
      // Wenn sich Quellcode ändert, wird der COPY . . Schritt invalidiert
      if (layer.instruction === 'COPY' && !layer.rest.includes('package')) {
        cacheInvalidated = true;
        return { ...layer, cached: false, reason: 'Dateien im Kontext geändert' };
      }
    }

    if (changedArtifact === 'package_json') {
      // Wenn sich package.json ändert, wird bereits der erste COPY package*.json Schritt invalidiert
      if (layer.instruction === 'COPY' && layer.rest.includes('package')) {
        cacheInvalidated = true;
        return { ...layer, cached: false, reason: 'package.json geändert' };
      }
    }

    return { ...layer, cached: true, reason: 'Schicht im Cache gefunden (CACHED)' };
  });
}

/**
 * Validiert Docker Compose Port- und Service-Mappings.
 * @param {Array<{ service: string, portHost: number, portContainer: number }>} mappings
 */
export function validateComposePorts(mappings) {
  const hostPorts = new Map();
  const conflicts = [];

  for (const m of mappings) {
    if (m.portHost < 1 || m.portHost > 65535) {
      conflicts.push(`Ungültiger Host-Port ${m.portHost} in Service '${m.service}'.`);
    }
    if (m.portContainer < 1 || m.portContainer > 65535) {
      conflicts.push(`Ungültiger Container-Port ${m.portContainer} in Service '${m.service}'.`);
    }

    if (hostPorts.has(m.portHost)) {
      conflicts.push(`Port-Kollision: Host-Port ${m.portHost} wird von '${hostPorts.get(m.portHost)}' und '${m.service}' beansprucht.`);
    } else {
      hostPorts.set(m.portHost, m.service);
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    boundPortsCount: hostPorts.size
  };
}

export const DOCKER_DRILL_QUESTIONS = [
  {
    id: 'docker-q1',
    question: 'Welchen Hauptvorteil bietet ein Multi-Stage Dockerfile in Produktions-Deployments?',
    options: [
      'Erlaubt das gleichzeitige Starten von mehreren Containern in einem Prozess.',
      'Trennt Build-Werkzeuge (Compiler, SDKs) vom finalen schlanken Runtime-Image, was die Imagegröße und Angriffsfläche drastisch minimiert.',
      'Erhöht die Netzwerkbandbreite zwischen Docker-Containern automatisch.',
      'Verhindert, dass Docker Volumes angelegt werden müssen.'
    ],
    correct: 1,
    explanation: 'Multi-Stage Builds trennen Zwischen-Build-Stufen (z. B. Node/Go/Maven) von der finalen Minimal-Stufe (z. B. Alpine/Distroless). Nur benötigte Artefakte werden per COPY --from kopiert.'
  },
  {
    id: 'docker-q2',
    question: 'Was ist der Unterschied zwischen CMD und ENTRYPOINT in einem Dockerfile?',
    options: [
      'ENTRYPOINT definiert den unveränderlichen Hauptbefehl des Containers, während CMD Standardargumente liefert, die beim `docker run` überschrieben werden können.',
      'CMD startet Prozesse immer mit Root-Rechten, ENTRYPOINT als unprivilegierter Benutzer.',
      'ENTRYPOINT funktioniert nur auf Windows-Containern, CMD auf Linux.',
      'Es gibt keinen technischen Unterschied; CMD ist lediglich die veraltete Syntax.'
    ],
    correct: 0,
    explanation: 'ENTRYPOINT legt das eigentliche Programm fest (z. B. ["nginx"]). CMD liefert die Standard-Flags (z. B. ["-g", "daemon off;"]), die der Benutzer bei Bedarf bei docker run überschreiben kann.'
  },
  {
    id: 'docker-q3',
    question: 'Wie lösen Container in einem benutzerdefinierten Docker Bridge-Netzwerk einander auf?',
    options: [
      'Über die /etc/hosts Datei, die minütlich synchronisiert wird.',
      'Über Broadcasts im Subnetz.',
      'Über den integrierten Docker DNS-Server (127.0.0.11), der den Containernamen auflöst.',
      'Container können in Bridge-Netzwerken ausschließlich über ihre statische IP angesprochen werden.'
    ],
    correct: 2,
    explanation: 'In benutzerdefinierten Bridge-Netzwerken bietet Docker einen eingebetteten DNS-Dienst (127.0.0.11), der Container über ihren Servicenamen auflöst.'
  },
  {
    id: 'docker-q4',
    question: 'Warum sollte `COPY package*.json ./` vor `COPY . .` und vor `RUN npm install` stehen?',
    options: [
      'Weil npm sonst eine Fehlermeldung bezüglich Zugriffsrechten ausgibt.',
      'Um das Schichten-Caching von Docker auszunutzen: npm install läuft nur erneut, wenn sich Abhängigkeiten geändert haben, nicht bei jeder Codezeilen-Änderung.',
      'Weil Dockerfile-Instruktionen strikt alphabetisch sortiert werden müssen.',
      'Weil COPY package*.json das Dateisystem automatisch sperrt.'
    ],
    correct: 1,
    explanation: 'Docker prüft den Cache von oben nach unten. Ändert sich nur der Anwendungscode, bleibt der Schritt `RUN npm install` gecacht, was Build-Zeiten drastisch verkürzt.'
  }
];
