// @ts-check
/**
 * AWS & Cloud IAM Policy Evaluator & Least-Privilege Linter Engine
 * Evaluates access decisions across SCPs (Service Control Policies), Identity-based Policies,
 * and Resource-based Policies with strict Explicit Deny precedence and Least-Privilege recommendations.
 */

/**
 * @typedef {'Allow' | 'Deny'} Effect
 */

/**
 * @typedef {Object} PolicyStatement
 * @property {string} sid Statement ID
 * @property {Effect} effect Allow or Deny
 * @property {string[]} actions List of IAM actions (e.g. 's3:GetObject', 's3:*', '*')
 * @property {string[]} resources Target ARNs (e.g. 'arn:aws:s3:::customer-data/*', '*')
 * @property {Object.<string, any>} [conditions] Optional policy conditions
 */

/**
 * @typedef {Object} IamPolicy
 * @property {string} id Policy identifier
 * @property {string} name Policy display name
 * @property {'IDENTITY' | 'SCP' | 'RESOURCE'} type Policy type
 * @property {PolicyStatement[]} statements Policy statements
 */

/**
 * @typedef {Object} EvaluationRequest
 * @property {string} principal Target role or user ARN
 * @property {string} action Requested IAM action (e.g. 's3:DeleteBucket')
 * @property {string} resource Requested resource ARN
 * @property {Object.<string, any>} [context] Request context (IP, MFA, secure transport)
 */

/**
 * @typedef {Object} EvaluationResult
 * @property {'ALLOWED' | 'DENIED'} decision Final access decision
 * @property {string} reason Detailed explanation of the evaluation logic
 * @property {'EXPLICIT_DENY' | 'EXPLICIT_ALLOW' | 'IMPLICIT_DENY' | 'SCP_BLOCK'} decisionSource
 * @property {string[]} matchedDenySids Statement IDs that caused Deny
 * @property {string[]} matchedAllowSids Statement IDs that granted Allow
 * @property {Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW', title: string, recommendation: string }>} leastPrivilegeFindings
 */

/**
 * Matches an IAM action against a pattern supporting wildcards (e.g., 's3:*', '*')
 * @param {string} pattern
 * @param {string} action
 * @returns {boolean}
 */
export function matchAction(pattern, action) {
  if (pattern === '*' || pattern === action) return true;
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return action.startsWith(prefix);
  }
  return false;
}

/**
 * Matches a resource ARN against a pattern supporting wildcards
 * @param {string} pattern
 * @param {string} resource
 * @returns {boolean}
 */
export function matchResource(pattern, resource) {
  if (pattern === '*' || pattern === resource) return true;
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return resource.startsWith(prefix);
  }
  return false;
}

/**
 * Evaluates whether an access request is permitted across SCPs, Identity and Resource policies.
 * Follows the standard AWS evaluation logic:
 * 1. Default decision: Implicit Deny
 * 2. Organization SCP check: If not explicitly allowed (or explicitly denied) -> Denied
 * 3. Explicit Deny in any applicable policy -> Immediate DENIED
 * 4. Explicit Allow in Identity or Resource policy -> ALLOWED
 * 5. Otherwise -> IMPLICIT DENY
 * 
 * @param {EvaluationRequest} request
 * @param {IamPolicy[]} policies
 * @returns {EvaluationResult}
 */
export function evaluateIamPolicies(request, policies) {
  const scpPolicies = policies.filter(p => p.type === 'SCP');
  const identityPolicies = policies.filter(p => p.type === 'IDENTITY');
  const resourcePolicies = policies.filter(p => p.type === 'RESOURCE');

  const matchedDenySids = [];
  const matchedAllowSids = [];

  // 1. Evaluate SCPs (Service Control Policies)
  // SCP acts as a guardrail filter: must have at least one Allow for the action/resource and 0 Denies
  if (scpPolicies.length > 0) {
    for (const scp of scpPolicies) {
      for (const stmt of scp.statements) {
        const actionMatch = stmt.actions.some(act => matchAction(act, request.action));
        const resMatch = stmt.resources.some(res => matchResource(res, request.resource));
        if (actionMatch && resMatch) {
          if (stmt.effect === 'Deny') {
            matchedDenySids.push(`${scp.name} [${stmt.sid}]`);
            return {
              decision: 'DENIED',
              reason: `Zugriff verweigert durch SCP Explicit Deny in Guardrail '${scp.name}' (Statement ${stmt.sid}).`,
              decisionSource: 'SCP_BLOCK',
              matchedDenySids,
              matchedAllowSids: [],
              leastPrivilegeFindings: analyzeLeastPrivilege(policies)
            };
          }
        }
      }
    }

    // Check if SCP permits action (SCP Whitelist check)
    const scpAllows = scpPolicies.some(scp =>
      scp.statements.some(stmt =>
        stmt.effect === 'Allow' &&
        stmt.actions.some(act => matchAction(act, request.action)) &&
        stmt.resources.some(res => matchResource(res, request.resource))
      )
    );

    if (!scpAllows) {
      return {
        decision: 'DENIED',
        reason: 'Zugriff verweigert: Die Organization SCP erlaubt diese Aktion nicht (SCP Guardrail Whitelist Filter).',
        decisionSource: 'SCP_BLOCK',
        matchedDenySids: ['SCP-Boundary-Block'],
        matchedAllowSids: [],
        leastPrivilegeFindings: analyzeLeastPrivilege(policies)
      };
    }
  }

  // 2. Check Explicit Deny in Identity & Resource Policies
  const operationalPolicies = [...identityPolicies, ...resourcePolicies];
  for (const pol of operationalPolicies) {
    for (const stmt of pol.statements) {
      if (stmt.effect === 'Deny') {
        const actionMatch = stmt.actions.some(act => matchAction(act, request.action));
        const resMatch = stmt.resources.some(res => matchResource(res, request.resource));
        if (actionMatch && resMatch) {
          matchedDenySids.push(`${pol.name} [${stmt.sid}]`);
        }
      }
    }
  }

  if (matchedDenySids.length > 0) {
    return {
      decision: 'DENIED',
      reason: `Zugriff verweigert: Explizites Deny gefunden in: ${matchedDenySids.join(', ')}. In IAM sticht Deny ausnahmslos jedes Allow.`,
      decisionSource: 'EXPLICIT_DENY',
      matchedDenySids,
      matchedAllowSids: [],
      leastPrivilegeFindings: analyzeLeastPrivilege(policies)
    };
  }

  // 3. Check Explicit Allow in Identity or Resource Policies
  for (const pol of operationalPolicies) {
    for (const stmt of pol.statements) {
      if (stmt.effect === 'Allow') {
        const actionMatch = stmt.actions.some(act => matchAction(act, request.action));
        const resMatch = stmt.resources.some(res => matchResource(res, request.resource));
        if (actionMatch && resMatch) {
          matchedAllowSids.push(`${pol.name} [${stmt.sid}]`);
        }
      }
    }
  }

  if (matchedAllowSids.length > 0) {
    return {
      decision: 'ALLOWED',
      reason: `Zugriff gestattet: Explizites Allow gewährt durch: ${matchedAllowSids.join(', ')}.`,
      decisionSource: 'EXPLICIT_ALLOW',
      matchedDenySids: [],
      matchedAllowSids,
      leastPrivilegeFindings: analyzeLeastPrivilege(policies)
    };
  }

  // 4. Default: Implicit Deny
  return {
    decision: 'DENIED',
    reason: 'Zugriff verweigert (Implizites Deny): Keine der Richtlinien enthält eine explizite Allow-Genehmigung für diese Aktion.',
    decisionSource: 'IMPLICIT_DENY',
    matchedDenySids: [],
    matchedAllowSids: [],
    leastPrivilegeFindings: analyzeLeastPrivilege(policies)
  };
}

/**
 * Lints policies for security over-privileges (Least Privilege Principle)
 * @param {IamPolicy[]} policies
 * @returns {Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW', title: string, recommendation: string }>}
 */
export function analyzeLeastPrivilege(policies) {
  /** @type {Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW', title: string, recommendation: string }>} */
  const findings = [];

  for (const pol of policies) {
    for (const stmt of pol.statements) {
      if (stmt.effect === 'Allow') {
        // Full Admin Wildcard Action Check
        if (stmt.actions.includes('*') && stmt.resources.includes('*')) {
          findings.push({
            severity: 'HIGH',
            title: `AdministratorAccess Wildcard in '${pol.name}'`,
            recommendation: `Statement '${stmt.sid}' gewährt '*' auf '*'. Ersetze dies durch spezifische Service-Aktionen und ARNs.`
          });
        } else if (stmt.actions.includes('*')) {
          findings.push({
            severity: 'HIGH',
            title: `Unbeschränkte Service-Aktionen in '${pol.name}'`,
            recommendation: `Statement '${stmt.sid}' erlaubt '*' Aktionen. Schränke die Aktionen auf die tatsächlich benötigten API-Calls ein.`
          });
        } else if (stmt.actions.some(act => act.endsWith(':*'))) {
          const serviceWildcard = stmt.actions.find(act => act.endsWith(':*'));
          findings.push({
            severity: 'MEDIUM',
            title: `Service-Wildcard '${serviceWildcard}' in '${pol.name}'`,
            recommendation: `Statement '${stmt.sid}' gewährt alle Aktionen eines Dienstes. Empfehlung: Read/Write separieren.`
          });
        }

        // Wildcard Resource Check for Destructive Actions
        const destructiveActions = stmt.actions.filter(a =>
          a.includes('Delete') || a.includes('Terminate') || a.includes('PutBucketPolicy') || a.includes('Drop')
        );
        if (destructiveActions.length > 0 && stmt.resources.includes('*')) {
          findings.push({
            severity: 'HIGH',
            title: `Kritische Schreib-/Lösch-Aktionen ohne Ressourcen-Grenze in '${pol.name}'`,
            recommendation: `Statement '${stmt.sid}' erlaubt destruktive Aktionen (${destructiveActions.join(', ')}) auf beliebige Ressourcen ('*'). Definiere dedizierte Ressourcen-ARNs.`
          });
        }
      }
    }
  }

  return findings;
}
