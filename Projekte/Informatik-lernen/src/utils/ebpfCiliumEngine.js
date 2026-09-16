/**
 * eBPF Cilium Service Mesh & L7 Tracing Engine
 * Simuliert Socket-Level Kernel Bypasses (sock_ops, sk_msg) und vergleicht eBPF Sidecarless Mesh mit Envoy Sidecars.
 */

export const MESH_MODES = {
  SIDECAR_ENVOY: 'sidecar_envoy',
  EBPF_CILIUM: 'ebpf_cilium'
};

/**
 * Simuliert einen L7 HTTP/gRPC Service-Call zwischen zwei Microservices (z. B. Frontend -> Payment)
 */
export function simulateServiceMeshHop({
  mode = MESH_MODES.EBPF_CILIUM,
  payloadSizeBytes = 2048,
  podCount = 10,
  enableL7Tracing = true
}) {
  const isCilium = mode === MESH_MODES.EBPF_CILIUM;

  // Berechnete Latenzen & Ressourcennutzung
  // Envoy Sidecars haben typischerweise 4 Kontextwechsel (User -> Kernel -> Envoy -> Kernel -> Envoy -> Kernel -> User)
  // Cilium mit eBPF sockmap redirection verbindet Sockets direkt im Kernelspace
  const baseLatencyMs = isCilium ? 0.35 : 2.65;
  const payloadFactor = (payloadSizeBytes / 1024) * 0.04;
  const tracingOverheadMs = enableL7Tracing ? (isCilium ? 0.05 : 0.45) : 0;

  const latencyP50 = Number((baseLatencyMs + payloadFactor + tracingOverheadMs).toFixed(2));
  const latencyP99 = Number((latencyP50 * (isCilium ? 1.4 : 2.2)).toFixed(2));

  // Memory Overhead pro Pod (Envoy benötigt ca. 50-80MB RAM pro Sidecar Container)
  const memoryPerPodMb = isCilium ? 0 : 65; // eBPF läuft im Kernel, kein Sidecar Container
  const totalMemoryOverheadMb = memoryPerPodMb * podCount;

  // CPU Nutzung relativ (Envoy muss TCP terminieren, parsen und neues TCP aufbauen)
  const cpuOverheadPct = isCilium ? 2.5 : 18.0;

  // Netzwerkpfad (Hops)
  const hops = isCilium
    ? [
        { name: 'App Pod A (User Space)', type: 'source' },
        { name: 'eBPF sockmap redirect (Linux Kernel Memory)', type: 'ebpf_bypass', desc: 'Umgeht TCP/IP Stack & iptables' },
        { name: 'App Pod B (User Space)', type: 'destination' }
      ]
    : [
        { name: 'App Pod A (User Space)', type: 'source' },
        { name: 'iptables PREROUTING / REDIRECT', type: 'network' },
        { name: 'Envoy Sidecar A (User Space)', type: 'proxy', desc: 'TCP Terminierung & Parsing' },
        { name: 'Linux TCP/IP Stack & veth', type: 'network' },
        { name: 'Envoy Sidecar B (User Space)', type: 'proxy', desc: 'Proxy Forwarding & Policy Check' },
        { name: 'iptables NAT', type: 'network' },
        { name: 'App Pod B (User Space)', type: 'destination' }
      ];

  return {
    mode,
    latencyP50,
    latencyP99,
    speedupFactor: Number(((2.65 + payloadFactor + 0.45) / (0.35 + payloadFactor + 0.05)).toFixed(1)),
    memoryPerPodMb,
    totalMemoryOverheadMb,
    cpuOverheadPct,
    hopCount: hops.length,
    hops,
    features: {
      zeroProxyOverhead: isCilium,
      kernelSocketBypass: isCilium,
      l7TracingSupport: true
    }
  };
}

/**
 * Generiert beispielhaften eBPF C-Code für Socket-Redirection (sock_ops / sk_msg)
 */
export function generateCiliumEbpfSnippet() {
  return `// cilium_sockops.c - Kernel-level socket redirection
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

struct {
    __uint(type, BPF_MAP_TYPE_SOCKHASH);
    __uint(max_entries, 65535);
    __type(key, struct sock_key);
    __type(value, __u64);
} sock_ops_map SEC(".maps");

SEC("sockops")
int bpf_sockmap(struct bpf_sock_ops *skops) {
    if (skops->family != AF_INET) return BPF_OK;

    switch (skops->op) {
    case BPF_SOCK_OPS_PASSIVE_ESTABLISHED_CB:
    case BPF_SOCK_OPS_ACTIVE_ESTABLISHED_CB:
        // Speichere Socket direkt in BPF Sockmap f\u00fcr Zero-Copy Weiterleitung
        bpf_sock_hash_update(skops, &sock_ops_map, &key, BPF_NOEXIST);
        break;
    }
    return BPF_OK;
}

SEC("sk_msg")
int bpf_redir(struct sk_msg_md *msg) {
    // Leite Datenpakete direkt im Kernel zum Ziel-Socket weiter (Bypass TCP/IP)
    return bpf_msg_redirect_hash(msg, &sock_ops_map, &key, BPF_F_INGRESS);
}

char _license[] SEC("license") = "GPL";`;
}
