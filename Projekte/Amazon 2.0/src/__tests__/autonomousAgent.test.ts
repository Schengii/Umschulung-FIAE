import { describe, it, expect } from 'vitest';
import { getAgentTasks, createAgentTask, executeAgentSimulation } from '../utils/autonomousAgent';
import { state } from '../store';

describe('Autonomous AI Shopping Agent & Budget Delegator', () => {
  it('creates autonomous purchasing rules and executes simulated buy', () => {
    const product = state.products[0];
    const task = createAgentTask(product, 250, 300, 1);

    expect(task.productTitle).toBe(product.title);
    expect(task.targetPrice).toBe(250);
    expect(task.status).toBe('active');

    const tasks = getAgentTasks();
    expect(tasks.length).toBeGreaterThan(0);

    const executed = executeAgentSimulation(state, task.id);
    expect(executed).toBe(true);

    const updatedTask = getAgentTasks().find(t => t.id === task.id);
    expect(updatedTask?.spentBudget).toBe(250);
    expect(updatedTask?.status).toBe('completed');
  });
});
