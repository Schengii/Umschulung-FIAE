import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WORKFLOW,
  resolveJobDependencyStages,
  maskSecrets,
  simulateJobExecution,
  executeWorkflowPipeline
} from './githubActionsEngine';

describe('githubActionsEngine (GitHub Actions CI/CD Pipeline Simulator)', () => {
  it('löst Job-Abhängigkeiten in korrekte parallele Ausführungsstufen (Stages) auf', () => {
    const res = resolveJobDependencyStages(DEFAULT_WORKFLOW.jobs);
    expect(res.hasCycle).toBe(false);
    expect(res.error).toBeNull();
    expect(res.stages.length).toBe(3);

    // Stage 1: lint (keine dependencies)
    expect(res.stages[0]).toEqual(['lint']);
    // Stage 2: test (braucht lint)
    expect(res.stages[1]).toEqual(['test']);
    // Stage 3: build (braucht test)
    expect(res.stages[2]).toEqual(['build']);
  });

  it('erkennt zyklische Job-Abhängigkeiten fehlerfrei', () => {
    const cyclicJobs = [
      { id: 'job_a', needs: ['job_b'] },
      { id: 'job_b', needs: ['job_a'] }
    ];
    const res = resolveJobDependencyStages(cyclicJobs);
    expect(res.hasCycle).toBe(true);
    expect(res.error).toContain('Zyklische Job-Abhängigkeit');
  });

  it('maskiert sensible Tokens und Passwörter mit Sternchen', () => {
    const env = { TOKEN: 'my_super_secret_token_12345' };
    const raw = 'Deploying with auth: my_super_secret_token_12345 to cluster';
    const masked = maskSecrets(raw, env);
    expect(masked).toBe('Deploying with auth: *** to cluster');
  });

  it('führt den gesamten Pipeline-Workflow mit Cache-Hit-Simulation durch', () => {
    // 1. Lauf: Cache MISS
    const res1 = executeWorkflowPipeline(DEFAULT_WORKFLOW, []);
    expect(res1.success).toBe(true);
    expect(res1.jobResults['test'].logs.some(l => l.includes('Cache MISS'))).toBe(true);

    // 2. Lauf: Cache HIT
    const res2 = executeWorkflowPipeline(DEFAULT_WORKFLOW, ['npm-deps-v1']);
    expect(res2.success).toBe(true);
    expect(res2.jobResults['test'].logs.some(l => l.includes('Cache HIT'))).toBe(true);
  });

  it('simuliert einen einzelnen Job mit Einzelschritten', () => {
    const job = DEFAULT_WORKFLOW.jobs[0];
    const res = simulateJobExecution(job, { hits: new Set() }, {});
    expect(res.jobId).toBe('lint');
    expect(res.success).toBe(true);
    expect(res.logs.length).toBeGreaterThan(0);
  });
});
