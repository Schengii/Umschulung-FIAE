/**
 * GitHub Actions Workflow CI/CD Simulator Engine
 * DAG Job Resolution (needs), Cache Hit/Miss, Secrets Masking & Step Runners
 */

export const DEFAULT_WORKFLOW = {
  name: 'Production CI/CD Pipeline',
  on: ['push', 'pull_request'],
  env: {
    NODE_ENV: 'test',
    DEPLOY_TOKEN: 'secret_live_token_xyz987'
  },
  jobs: [
    {
      id: 'lint',
      name: 'Lint & Code Quality',
      runs_on: 'ubuntu-latest',
      needs: [],
      steps: [
        { id: 'step_1', name: 'Checkout code', uses: 'actions/checkout@v4', durationMs: 400 },
        { id: 'step_2', name: 'Setup Node.js 20', uses: 'actions/setup-node@v4', durationMs: 600 },
        { id: 'step_3', name: 'Run Oxlint', run: 'npm run lint', durationMs: 350 }
      ]
    },
    {
      id: 'test',
      name: 'Unit & Integration Tests',
      runs_on: 'ubuntu-latest',
      needs: ['lint'],
      steps: [
        { id: 'step_1', name: 'Checkout code', uses: 'actions/checkout@v4', durationMs: 400 },
        { id: 'step_2', name: 'Restore npm cache', uses: 'actions/cache@v4', cacheKey: 'npm-deps-v1', durationMs: 250 },
        { id: 'step_3', name: 'Run Vitest Suite', run: 'npm test -- --coverage', durationMs: 800 }
      ]
    },
    {
      id: 'build',
      name: 'Vite Production Build',
      runs_on: 'ubuntu-latest',
      needs: ['test'],
      steps: [
        { id: 'step_1', name: 'Checkout code', uses: 'actions/checkout@v4', durationMs: 400 },
        { id: 'step_2', name: 'Run Vite Build', run: 'npm run build', durationMs: 950 },
        { id: 'step_3', name: 'Upload Artifacts', uses: 'actions/upload-artifact@v4', durationMs: 300 }
      ]
    }
  ]
};

/**
 * Löst die Ausführungsreihenfolge der Jobs anhand von 'needs' auf (DAG)
 */
export function resolveJobDependencyStages(jobs) {
  const jobMap = new Map();
  const inDegree = new Map();
  const graph = new Map();

  jobs.forEach(j => {
    jobMap.set(j.id, j);
    inDegree.set(j.id, 0);
    graph.set(j.id, []);
  });

  jobs.forEach(j => {
    const deps = j.needs || [];
    deps.forEach(depId => {
      if (jobMap.has(depId)) {
        graph.get(depId).push(j.id);
        inDegree.set(j.id, (inDegree.get(j.id) || 0) + 1);
      }
    });
  });

  const stages = [];
  let currentStage = [];

  inDegree.forEach((deg, id) => {
    if (deg === 0) currentStage.push(id);
  });

  const processedCount = { value: 0 };

  while (currentStage.length > 0) {
    stages.push(currentStage);
    processedCount.value += currentStage.length;

    const nextStage = [];
    currentStage.forEach(currId => {
      const neighbors = graph.get(currId) || [];
      neighbors.forEach(nextId => {
        const d = inDegree.get(nextId) - 1;
        inDegree.set(nextId, d);
        if (d === 0) nextStage.push(nextId);
      });
    });

    currentStage = nextStage;
  }

  const hasCycle = processedCount.value !== jobs.length;

  return {
    stages,
    hasCycle,
    error: hasCycle ? 'Zyklische Job-Abhängigkeit in needs erkannt!' : null
  };
}

/**
 * Maskiert sensible Umgebungsvariablen / Secrets im Log
 */
export function maskSecrets(text, secrets = {}) {
  let result = text;
  Object.values(secrets).forEach(secretVal => {
    if (secretVal && typeof secretVal === 'string' && secretVal.length >= 4) {
      result = result.split(secretVal).join('***');
    }
  });
  return result;
}

/**
 * Simuliert die Ausführung eines einzelnen Jobs
 */
export function simulateJobExecution(job, cacheState = { hits: new Set() }, secrets = {}) {
  const stepLogs = [];
  let totalDuration = 0;
  let success = true;

  stepLogs.push(`=== Running Job: ${job.name} on [${job.runs_on}] ===`);

  job.steps.forEach((step, idx) => {
    let stepDuration = step.durationMs || 500;
    let detail = '';

    if (step.uses === 'actions/cache@v4' && step.cacheKey) {
      const isHit = cacheState.hits.has(step.cacheKey);
      if (isHit) {
        detail = `Cache HIT for key: ${step.cacheKey} (gespart: 12.4s)`;
        stepDuration = Math.round(stepDuration * 0.3);
      } else {
        detail = `Cache MISS for key: ${step.cacheKey} (Download von Remote Cache)`;
        cacheState.hits.add(step.cacheKey);
      }
    } else if (step.run) {
      detail = maskSecrets(`$ ${step.run} -> exit code 0`, secrets);
    } else {
      detail = `Using action: ${step.uses}`;
    }

    totalDuration += stepDuration;
    stepLogs.push(`  [${idx + 1}/${job.steps.length}] ✓ ${step.name} (${stepDuration}ms) - ${detail}`);
  });

  return {
    jobId: job.id,
    success,
    durationMs: totalDuration,
    logs: stepLogs
  };
}

/**
 * Führt den gesamten CI/CD Pipeline Workflow sequentiell nach DAG-Stages aus
 */
export function executeWorkflowPipeline(workflow = DEFAULT_WORKFLOW, initialCache = []) {
  const { stages, hasCycle, error } = resolveJobDependencyStages(workflow.jobs);

  if (hasCycle) {
    return {
      success: false,
      error,
      stages: [],
      jobResults: {},
      totalDurationMs: 0,
      logs: [`[FATAL] ${error}`]
    };
  }

  const cacheState = { hits: new Set(initialCache) };
  const jobResults = {};
  const allLogs = [`Starting GitHub Actions Workflow: "${workflow.name}"`];
  let totalPipelineDuration = 0;

  stages.forEach((stage, stageIdx) => {
    allLogs.push(`--> Stage ${stageIdx + 1}: Running jobs in parallel [${stage.join(', ')}]`);
    let stageMaxDuration = 0;

    stage.forEach(jobId => {
      const job = workflow.jobs.find(j => j.id === jobId);
      if (!job) return;
      const res = simulateJobExecution(job, cacheState, workflow.env);
      jobResults[jobId] = res;
      allLogs.push(...res.logs);
      if (res.durationMs > stageMaxDuration) {
        stageMaxDuration = res.durationMs;
      }
    });

    totalPipelineDuration += stageMaxDuration;
  });

  allLogs.push(`Workflow completed successfully in ${(totalPipelineDuration / 1000).toFixed(2)}s`);

  return {
    success: true,
    stages,
    jobResults,
    totalDurationMs: totalPipelineDuration,
    logs: allLogs
  };
}
