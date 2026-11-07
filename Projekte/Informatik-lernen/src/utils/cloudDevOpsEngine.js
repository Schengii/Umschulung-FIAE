// @ts-check
/**
 * Fachlogik-Engine für das Cloud Infrastructure & DevOps Lab.
 * Validiert CI/CD-Pipelines, simuliert Pipeline-Stufen (DAG, Abhängigkeiten),
 * berechnet Cloud-Infrastruktur-Kosten (TCO) und liefert IHK-Prüfungsfragen.
 */

/**
 * Validiert ein GitHub Actions / CI-CD Pipeline Manifest.
 * @param {string} yaml
 */
export function validatePipelineYaml(yaml) {
  const issues = [];
  const lines = yaml.split('\n');

  const hasName = lines.some((l) => l.trim().startsWith('name:'));
  const hasOn = lines.some((l) => l.trim().startsWith('on:'));
  const hasJobs = lines.some((l) => l.trim().startsWith('jobs:'));

  if (!hasName) issues.push("Best Practice: 'name:' für die Pipeline definieren.");
  if (!hasOn) issues.push("Trigger fehlt: 'on:' Event erforderlich (z. B. push, pull_request).");
  if (!hasJobs) issues.push("Fehlender 'jobs:' Block: Keine Pipeline-Aufgaben definiert.");

  // Sicherheits- & Best-Practice-Prüfungen
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/password:\s*['"]?[a-zA-Z0-9_\-!]{4,}['"]?/i.test(trimmed) && !trimmed.includes('secrets.')) {
      issues.push(`Zeile ${idx + 1}: Mögliches Klartext-Passwort gefunden. Nutze '\${{ secrets.* }}'.`);
    }
    if (/npm\s+install\b/.test(trimmed) && !trimmed.includes('npm ci')) {
      issues.push(`Zeile ${idx + 1}: In CI-Pipelines sollte 'npm ci' anstelle von 'npm install' für deterministische Builds verwendet werden.`);
    }
    if (/uses:\s*actions\/[a-zA-Z0-9_-]+@v\d+/i.test(trimmed)) {
      issues.push(`Zeile ${idx + 1}: Actions sollten für maximale Sicherheit mit vollem 40-Zeichen SHA gepinnt werden.`);
    }
  });

  const hardErrors = issues.filter((i) => !i.startsWith('Best Practice:') && !i.startsWith('Zeile '));

  return {
    isValid: hardErrors.length === 0,
    issues,
    hardErrors
  };
}

/**
 * Simuliert die Ausführung einer sequentiellen oder abhängigen CI/CD Pipeline.
 * @param {Array<{ id: string, name: string, durationSec: number, needs?: string }>} stages
 * @param {string | null} failingStageId
 */
export function simulatePipelineRun(stages, failingStageId = null) {
  let hasFailed = false;

  return stages.map((stage) => {
    if (hasFailed) {
      return {
        ...stage,
        status: 'skipped',
        actualDuration: 0,
        message: 'Übersprungen: Vorherige Stufe fehlgeschlagen'
      };
    }

    if (stage.id === failingStageId) {
      hasFailed = true;
      return {
        ...stage,
        status: 'failed',
        actualDuration: Math.round(stage.durationSec * 0.4),
        message: 'Fehlgeschlagen mit Exit-Code 1'
      };
    }

    return {
      ...stage,
      status: 'success',
      actualDuration: stage.durationSec,
      message: 'Erfolgreich ausgeführt (Exit 0)'
    };
  });
}

/**
 * Berechnet monatliche Cloud-Infrastrukturkosten.
 * @param {{
 *   instances: number,
 *   vCpuPerInstance: number,
 *   ramGbPerInstance: number,
 *   storageGb: number,
 *   egressGb: number
 * }} spec
 */
export function calculateCloudCost(spec) {
  // Richtwerte für Cloud-VMs / Storage (z. B. AWS / Hetzner Cloud Mix)
  const COST_PER_VCPU_MONTH = 7.5; // € pro vCPU Monat
  const COST_PER_GB_RAM_MONTH = 2.0; // € pro GB RAM Monat
  const COST_PER_GB_SSD_MONTH = 0.08; // € pro GB NVMe/SSD
  const COST_PER_GB_EGRESS = 0.05; // € pro GB Outbound Traffic

  const computeCost = spec.instances * (spec.vCpuPerInstance * COST_PER_VCPU_MONTH + spec.ramGbPerInstance * COST_PER_GB_RAM_MONTH);
  const storageCost = spec.storageGb * COST_PER_GB_SSD_MONTH;
  const networkCost = Math.max(0, spec.egressGb - 100) * COST_PER_GB_EGRESS; // 100 GB Free Tier

  const totalMonthlyCost = Math.round((computeCost + storageCost + networkCost) * 100) / 100;

  return {
    computeCost: Math.round(computeCost * 100) / 100,
    storageCost: Math.round(storageCost * 100) / 100,
    networkCost: Math.round(networkCost * 100) / 100,
    totalMonthlyCost
  };
}

export const CLOUD_DEVOPS_DRILL_QUESTIONS = [
  {
    id: 'devops-q1',
    question: 'Was ist der zentrale Unterschied zwischen Continuous Delivery und Continuous Deployment?',
    options: [
      'Continuous Delivery erfordert Docker, Continuous Deployment nutzt Kubernetes.',
      'Bei Continuous Delivery wird jedes Release automatisch bis in die Staging-Umgebung gebaut/getestet, der finale Produktions-Rollout erfordert jedoch eine manuelle Freigabe. Bei Continuous Deployment wird jede Änderung automatisch bis in die Produktion ausgerollt.',
      'Continuous Deployment ist ausschließlich für Frontend-Projekte relevant.',
      'Continuous Delivery kompiliert den Quellcode auf den Entwickler-Laptops.'
    ],
    correct: 1,
    explanation: 'Continuous Delivery stellt sicher, dass der Code jederzeit deploybar ist, behält aber ein manuelles Gate für die Freigabe bei. Continuous Deployment automatisiert auch diesen letzten Schritt vollständig.'
  },
  {
    id: 'devops-q2',
    question: 'Welches Deployment-Muster leitet Traffic schrittweise um (z. B. 95% alt, 5% neu), um Fehlerraten vor dem globalen Rollout zu minimieren?',
    options: [
      'Blue-Green Deployment',
      'Canary Deployment',
      'Recreate Deployment',
      'Big Bang Deployment'
    ],
    correct: 1,
    explanation: 'Canary Deployment benennt die Methode, eine neue Version zunächst an einen kleinen Prozentsatz echter Nutzer (z. B. 5%) auszuliefern. Metriken und Fehlerquoten werden überwacht, bevor 100% des Traffics umgestellt werden.'
  },
  {
    id: 'devops-q3',
    question: 'Was versteht man unter einem „Cold Start“ bei Serverless Function-as-a-Service (FaaS wie AWS Lambda)?',
    options: [
      'Das Starten des Servers bei Minustemperaturen im Rechenzentrum.',
      'Die anfängliche Latenzverzögerung, wenn eine Funktion nach Inaktivität erstmals aufgerufen wird und der Cloud-Provider die Ausführungsumgebung (Container/MicroVM) neu initialisieren muss.',
      'Das Beenden einer abgestürzten Funktion nach einem Timeout.',
      'Das Einspielen von Sicherheitsupdates des Host-Betriebssystems.'
    ],
    correct: 1,
    explanation: 'Liegt eine Funktion inaktiv vor, skaliert der Provider auf 0 Instanzen herunter. Beim nächsten Request entsteht ein Cold Start: Runtime hochfahren, Code laden und initialisieren, was messbare Latenz (100–1000 ms) erzeugt.'
  },
  {
    id: 'devops-q4',
    question: 'Welchen Vorteil bietet deklaratives Infrastructure as Code (IaC wie Terraform/Pulumi) gegenüber imperativen Shell-Skripten?',
    options: [
      'Deklaratives IaC beschreibt den gewünschten Zielzustand; das Tool berechnet die notwendigen Differenzen (Drift-Erkennung, Idempotenz), während Skripte jeden Schritt blind wiederholen.',
      'Deklaratives IaC benötigt keine Authentifizierung beim Cloud-Provider.',
      'Deklaratives IaC läuft ausschließlich lokal ohne Netzwerkzugriff.',
      'Skripte können keine Cloud-Ressourcen erstellen.'
    ],
    correct: 0,
    explanation: 'Deklaratives IaC beschreibt DAS WAS (Soll-Zustand). Die Engine vergleicht den Ist-Zustand mit dem Soll-Zustand und führt nur die notwendigen Create-, Update- oder Delete-Operationen idempotent aus.'
  }
];
