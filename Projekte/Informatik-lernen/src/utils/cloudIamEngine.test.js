import { describe, it, expect } from 'vitest';
import {
  matchAction,
  matchResource,
  evaluateIamPolicies,
  analyzeLeastPrivilege
} from './cloudIamEngine';

describe('cloudIamEngine', () => {
  it('correctly matches wildcard and exact actions and resources', () => {
    expect(matchAction('s3:*', 's3:GetObject')).toBe(true);
    expect(matchAction('s3:GetObject', 's3:GetObject')).toBe(true);
    expect(matchAction('s3:GetObject', 's3:PutObject')).toBe(false);
    expect(matchAction('*', 'ec2:RunInstances')).toBe(true);

    expect(matchResource('arn:aws:s3:::bucket/*', 'arn:aws:s3:::bucket/file.txt')).toBe(true);
    expect(matchResource('*', 'arn:aws:sqs:us-east-1:123456789012:queue')).toBe(true);
    expect(matchResource('arn:aws:s3:::bucket1/*', 'arn:aws:s3:::bucket2/file.txt')).toBe(false);
  });

  it('allows access when explicit Allow exists and no Deny is present', () => {
    const policies = [
      {
        id: 'pol-1',
        name: 'DeveloperS3Access',
        type: 'IDENTITY',
        statements: [
          {
            sid: 'AllowReadS3',
            effect: 'Allow',
            actions: ['s3:GetObject'],
            resources: ['arn:aws:s3:::my-bucket/*']
          }
        ]
      }
    ];

    const result = evaluateIamPolicies(
      {
        principal: 'arn:aws:iam::123456789012:role/DevRole',
        action: 's3:GetObject',
        resource: 'arn:aws:s3:::my-bucket/data.json'
      },
      policies
    );

    expect(result.decision).toBe('ALLOWED');
    expect(result.decisionSource).toBe('EXPLICIT_ALLOW');
    expect(result.matchedAllowSids.length).toBeGreaterThan(0);
  });

  it('strictly prioritizes Explicit Deny over any Explicit Allow', () => {
    const policies = [
      {
        id: 'pol-allow',
        name: 'FullAdminPolicy',
        type: 'IDENTITY',
        statements: [
          {
            sid: 'AllowAll',
            effect: 'Allow',
            actions: ['*'],
            resources: ['*']
          }
        ]
      },
      {
        id: 'pol-deny',
        name: 'ProtectProductionBucket',
        type: 'RESOURCE',
        statements: [
          {
            sid: 'DenyDeleteProduction',
            effect: 'Deny',
            actions: ['s3:DeleteBucket', 's3:DeleteObject'],
            resources: ['arn:aws:s3:::production-backup/*']
          }
        ]
      }
    ];

    const result = evaluateIamPolicies(
      {
        principal: 'arn:aws:iam::123456789012:role/AdminRole',
        action: 's3:DeleteObject',
        resource: 'arn:aws:s3:::production-backup/important.tar.gz'
      },
      policies
    );

    expect(result.decision).toBe('DENIED');
    expect(result.decisionSource).toBe('EXPLICIT_DENY');
    expect(result.matchedDenySids[0]).toContain('DenyDeleteProduction');
  });

  it('denies access if SCP guardrail does not permit the action or has an explicit deny', () => {
    const policies = [
      {
        id: 'scp-guardrail',
        name: 'OrganizationGuardrailSCP',
        type: 'SCP',
        statements: [
          {
            sid: 'DenyLeavingEuRegion',
            effect: 'Deny',
            actions: ['ec2:RunInstances'],
            resources: ['*']
          }
        ]
      },
      {
        id: 'pol-dev',
        name: 'Ec2FullAccess',
        type: 'IDENTITY',
        statements: [
          {
            sid: 'AllowEc2',
            effect: 'Allow',
            actions: ['ec2:*'],
            resources: ['*']
          }
        ]
      }
    ];

    const result = evaluateIamPolicies(
      {
        principal: 'arn:aws:iam::123456789012:user/developer',
        action: 'ec2:RunInstances',
        resource: 'arn:aws:ec2:us-east-1:123456789012:instance/*'
      },
      policies
    );

    expect(result.decision).toBe('DENIED');
    expect(result.decisionSource).toBe('SCP_BLOCK');
  });

  it('identifies least privilege violations such as full admin wildcards and unconstrained delete actions', () => {
    const policies = [
      {
        id: 'p-risky',
        name: 'OverprivilegedDevPolicy',
        type: 'IDENTITY',
        statements: [
          {
            sid: 'FullWildcard',
            effect: 'Allow',
            actions: ['*'],
            resources: ['*']
          },
          {
            sid: 'DestructiveActionNoBoundary',
            effect: 'Allow',
            actions: ['s3:DeleteBucket'],
            resources: ['*']
          }
        ]
      }
    ];

    const findings = analyzeLeastPrivilege(policies);
    expect(findings.length).toBeGreaterThanOrEqual(2);
    expect(findings.some(f => f.title.includes('AdministratorAccess Wildcard'))).toBe(true);
    expect(findings.some(f => f.title.includes('Kritische Schreib-/Lösch-Aktionen'))).toBe(true);
  });
});
