import { describe, it, expect } from 'vitest';
import {
  validateBpmnProcess,
  stepBpmnExecution,
  IHK_BPMN_TEMPLATES
} from './bpmnProcessEngine';

describe('bpmnProcessEngine', () => {
  it('validates pre-defined IHK order fulfillment template as 100% valid', () => {
    const template = IHK_BPMN_TEMPLATES.order_fulfillment;
    const result = validateBpmnProcess(template);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('validates incident management template as 100% valid', () => {
    const template = IHK_BPMN_TEMPLATES.incident_management;
    const result = validateBpmnProcess(template);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing start event and dead ends', () => {
    const invalidProcess = {
      id: 'broken',
      title: 'Broken Process',
      description: 'Test',
      lanes: [{ id: 'l1', name: 'Lane 1' }],
      nodes: [
        { id: 't1', name: 'Task without start', type: 'USER_TASK', laneId: 'l1' },
        { id: 't2', name: 'Task without end', type: 'USER_TASK', laneId: 'l1' }
      ],
      flows: [
        { id: 'f1', from: 't1', to: 't2' }
      ]
    };

    const result = validateBpmnProcess(invalidProcess);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Startereignis'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Endereignis'))).toBe(true);
  });

  it('simulates token propagation through parallel AND gateways', () => {
    const template = IHK_BPMN_TEMPLATES.order_fulfillment;

    // Start at start event
    let current = ['start_1'];
    current = stepBpmnExecution(template, current);
    expect(current).toEqual(['task_boni']);

    current = stepBpmnExecution(template, current);
    expect(current).toEqual(['gw_xor_1']);

    // Follow positive credit check branch
    current = stepBpmnExecution(template, current, 'Ja');
    expect(current).toEqual(['gw_and_fork']);

    // Fork into 2 parallel tasks: picking in warehouse & invoicing in accounting
    current = stepBpmnExecution(template, current);
    expect(current).toContain('task_pick');
    expect(current).toContain('task_invoice');
  });
});
