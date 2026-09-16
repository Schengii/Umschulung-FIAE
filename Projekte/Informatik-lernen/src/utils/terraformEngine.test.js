import { describe, it, expect } from 'vitest';
import { 
  calculateTerraformPlan, 
  getDeploymentOrder, 
  DEFAULT_TERRAFORM_RESOURCES 
} from './terraformEngine';

describe('terraformEngine (IaC Plan, Diff & DAG Resolver)', () => {
  it('berechnet Terraform Plan mit Neu-Erstellung bei leerem State', () => {
    const plan = calculateTerraformPlan(DEFAULT_TERRAFORM_RESOURCES, []);

    expect(plan.createCount).toBe(5);
    expect(plan.updateCount).toBe(0);
    expect(plan.destroyCount).toBe(0);
    expect(plan.summaryText).toBe('Plan: 5 to add, 0 to change, 0 to destroy.');
    expect(plan.planActions.every(p => p.action === 'create')).toBe(true);
  });

  it('erkennt Attribut-Änderungen und Löschungen (Destroy)', () => {
    const currentState = [
      { id: 'aws_vpc.main', attributes: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: false } },
      { id: 'aws_obsolete.db', attributes: { engine: 'mysql' } }
    ];

    const desired = [
      { id: 'aws_vpc.main', attributes: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: true } }
    ];

    const plan = calculateTerraformPlan(desired, currentState);
    expect(plan.createCount).toBe(0);
    expect(plan.updateCount).toBe(1);
    expect(plan.destroyCount).toBe(1);

    const updateAction = plan.planActions.find(p => p.id === 'aws_vpc.main');
    expect(updateAction.action).toBe('update');
    expect(updateAction.diffs[0].key).toBe('enable_dns_hostnames');

    const destroyAction = plan.planActions.find(p => p.id === 'aws_obsolete.db');
    expect(destroyAction.action).toBe('destroy');
  });

  it('löst DAG Abhängigkeiten in korrekter Bereitstellungsreihenfolge auf', () => {
    const depResult = getDeploymentOrder(DEFAULT_TERRAFORM_RESOURCES);

    expect(depResult.hasCircularDependency).toBe(false);
    expect(depResult.order[0]).toBe('aws_vpc.main');
    // Instance muss nach subnet und security group kommen
    const instanceIdx = depResult.order.indexOf('aws_instance.app_server');
    const subnetIdx = depResult.order.indexOf('aws_subnet.public_a');
    const sgIdx = depResult.order.indexOf('aws_security_group.web');

    expect(instanceIdx).toBeGreaterThan(subnetIdx);
    expect(instanceIdx).toBeGreaterThan(sgIdx);
  });
});
