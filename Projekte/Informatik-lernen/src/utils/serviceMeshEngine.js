/**
 * Service Mesh mTLS, Envoy Sidecar & Traffic Shifting Engine
 * Simulates Envoy proxy sidecar interception, SPIFFE/SPIRE X.509 identity validation,
 * and Canary Deployment weighted traffic routing.
 */

export class ServiceMeshSimulator {
  constructor() {
    this.mtlsMode = 'STRICT'; // 'STRICT' | 'PERMISSIVE' | 'DISABLED'
    this.canaryWeightV1 = 90;
    this.canaryWeightV2 = 10;
    this.clientSpiffeId = 'spiffe://cluster.local/ns/prod/sa/frontend-service';
    this.targetSpiffeId = 'spiffe://cluster.local/ns/prod/sa/order-service';
    this.routingHistory = [];
  }

  setCanaryWeights(v1Weight) {
    this.canaryWeightV1 = Math.max(0, Math.min(100, v1Weight));
    this.canaryWeightV2 = 100 - this.canaryWeightV1;
    return { v1: this.canaryWeightV1, v2: this.canaryWeightV2 };
  }

  routeRequest(requestId = 101) {
    // 1. mTLS Handshake & SPIFFE Verification
    let mtlsStatus = 'ESTABLISHED';
    if (this.mtlsMode === 'DISABLED') {
      mtlsStatus = 'CLEARTEXT (Insecure)';
    }

    // 2. Canary Route decision
    const rand = Math.random() * 100;
    const selectedVersion = rand < this.canaryWeightV1 ? 'v1 (Stable 1.4.2)' : 'v2 (Canary 1.5.0-rc)';

    const entry = {
      requestId,
      clientSpiffe: this.clientSpiffeId,
      targetSpiffe: this.targetSpiffeId,
      mtlsMode: this.mtlsMode,
      mtlsStatus,
      envoyPortIntercept: '15001 (iptables REDIRECT)',
      selectedVersion,
      timestamp: new Date().toISOString()
    };

    this.routingHistory.unshift(entry);
    return entry;
  }

  generateVirtualServiceYaml() {
    return `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service-routing
  namespace: prod
spec:
  hosts:
    - order-service.prod.svc.cluster.local
  http:
    - route:
        - destination:
            host: order-service
            subset: v1
          weight: ${this.canaryWeightV1}
        - destination:
            host: order-service
            subset: v2
          weight: ${this.canaryWeightV2}
---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: prod
spec:
  mtls:
    mode: ${this.mtlsMode}`;
  }
}
