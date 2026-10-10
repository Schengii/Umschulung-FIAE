// @ts-check
/**
 * Kubernetes Gateway API & Envoy Traffic Splitting Engine
 * Models GatewayClass, Gateway (listeners, ports, protocols), and HTTPRoute (rules, hostnames, matches, backendRefs with weights).
 * Simulates weighted traffic splitting (e.g. 90% stable vs. 10% canary) and header-based routing with random distribution statistics.
 */

/**
 * @typedef {Object} BackendRef
 * @property {string} name Service name (e.g. 'order-service-v1')
 * @property {number} port Service port
 * @property {number} weight Traffic weight (e.g. 90 or 10)
 */

/**
 * @typedef {Object} HeaderMatch
 * @property {string} name Header name (e.g. 'X-Canary-User', 'Authorization')
 * @property {'Exact' | 'RegularExpression'} type
 * @property {string} value Expected value
 */

/**
 * @typedef {Object} RouteRule
 * @property {string[]} [matchesPath] Path prefixes (e.g. ['/api/v2/orders'])
 * @property {HeaderMatch[]} [matchesHeaders] Required headers
 * @property {BackendRef[]} backendRefs Target backends with weights
 * @property {boolean} [requestMirror] Whether traffic is mirrored (shadowing) to a test backend
 * @property {string} [mirrorBackend] Name of the mirror backend
 */

/**
 * @typedef {Object} HttpRouteConfig
 * @property {string} name Name of the HTTPRoute
 * @property {string} gatewayName Attached Gateway name
 * @property {string[]} hostnames Attached hostnames (e.g. ['api.company.de'])
 * @property {RouteRule[]} rules List of routing rules
 */

/**
 * Evaluates target backend for an incoming HTTP request against HTTPRoute rules
 * @param {Object} request
 * @param {string} request.path
 * @param {Object.<string, string>} request.headers
 * @param {HttpRouteConfig} routeConfig
 * @param {number} [randomSeed] Value between 0 and 1 for weight distribution
 * @returns {{ selectedBackend: string, matchedRuleIndex: number, isCanary: boolean, isMirrored: boolean, mirrorTarget?: string }}
 */
export function routeRequest(request, routeConfig, randomSeed = Math.random()) {
  for (let ruleIndex = 0; ruleIndex < routeConfig.rules.length; ruleIndex++) {
    const rule = routeConfig.rules[ruleIndex];

    // 1. Path Match Check
    const pathMatches = !rule.matchesPath || rule.matchesPath.some(p => request.path.startsWith(p));
    if (!pathMatches) continue;

    // 2. Header Match Check
    let headersMatch = true;
    if (rule.matchesHeaders && rule.matchesHeaders.length > 0) {
      headersMatch = rule.matchesHeaders.every(hm => {
        const headerVal = request.headers[hm.name] || request.headers[hm.name.toLowerCase()];
        if (!headerVal) return false;
        if (hm.type === 'Exact') return headerVal === hm.value;
        if (hm.type === 'RegularExpression') return new RegExp(hm.value).test(headerVal);
        return false;
      });
    }

    if (headersMatch) {
      // 3. BackendRef weighted selection
      const totalWeight = rule.backendRefs.reduce((acc, b) => acc + b.weight, 0);
      if (totalWeight <= 0) {
        return {
          selectedBackend: rule.backendRefs[0]?.name || 'none',
          matchedRuleIndex: ruleIndex,
          isCanary: false,
          isMirrored: false
        };
      }

      const randomWeight = randomSeed * totalWeight;
      let cumulative = 0;
      let selected = rule.backendRefs[0].name;

      for (const backend of rule.backendRefs) {
        cumulative += backend.weight;
        if (randomWeight <= cumulative) {
          selected = backend.name;
          break;
        }
      }

      const isCanary = selected.includes('v2') || selected.includes('canary');

      return {
        selectedBackend: selected,
        matchedRuleIndex: ruleIndex,
        isCanary,
        isMirrored: !!rule.requestMirror,
        mirrorTarget: rule.mirrorBackend
      };
    }
  }

  // Fallback if no rule matched
  return {
    selectedBackend: 'default-404-handler',
    matchedRuleIndex: -1,
    isCanary: false,
    isMirrored: false
  };
}

/**
 * Simulates a batch of requests to verify actual weight percentage distribution
 * @param {number} count
 * @param {{ path: string, headers: Record<string, string> }} request
 * @param {HttpRouteConfig} routeConfig
 * @returns {Record<string, { count: number, percent: number }>}
 */
export function simulateTrafficDistribution(count, request, routeConfig) {
  /** @type {Record<string, number>} */
  const counts = {};

  for (let i = 0; i < count; i++) {
    const res = routeRequest(request, routeConfig, Math.random());
    counts[res.selectedBackend] = (counts[res.selectedBackend] || 0) + 1;
  }

  /** @type {Record<string, { count: number, percent: number }>} */
  const result = {};
  for (const [backend, c] of Object.entries(counts)) {
    result[backend] = {
      count: c,
      percent: Number(((c / count) * 100).toFixed(1))
    };
  }

  return result;
}

/**
 * Generates valid Kubernetes Gateway API YAML manifest for Gateway and HTTPRoute
 * @param {HttpRouteConfig} routeConfig
 * @returns {string}
 */
export function generateGatewayApiYaml(routeConfig) {
  return `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: ${routeConfig.gatewayName}
  namespace: default
spec:
  gatewayClassName: envoy-gateway
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: Same
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: ${routeConfig.name}
  namespace: default
spec:
  parentRefs:
    - name: ${routeConfig.gatewayName}
  hostnames:
${routeConfig.hostnames.map(h => `    - "${h}"`).join('\n')}
  rules:
${routeConfig.rules.map(r => `    - matches:
        - path:
            type: PathPrefix
            value: ${r.matchesPath?.[0] || '/'}
      backendRefs:
${r.backendRefs.map(b => `        - name: ${b.name}
          port: ${b.port}
          weight: ${b.weight}`).join('\n')}`).join('\n')}`;
}
