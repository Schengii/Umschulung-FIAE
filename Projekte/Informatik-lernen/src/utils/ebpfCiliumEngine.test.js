import { describe, it, expect } from 'vitest';
import { 
  simulateServiceMeshHop, 
  generateCiliumEbpfSnippet, 
  MESH_MODES 
} from './ebpfCiliumEngine';

describe('ebpfCiliumEngine', () => {
  it('simuliert eBPF-Cilium Socket Bypass mit signifikant geringerer Latenz als Sidecars', () => {
    const ciliumResult = simulateServiceMeshHop({
      mode: MESH_MODES.EBPF_CILIUM,
      podCount: 20
    });

    const sidecarResult = simulateServiceMeshHop({
      mode: MESH_MODES.SIDECAR_ENVOY,
      podCount: 20
    });

    expect(ciliumResult.latencyP50).toBeLessThan(sidecarResult.latencyP50);
    expect(ciliumResult.speedupFactor).toBeGreaterThanOrEqual(4.0);
    expect(ciliumResult.totalMemoryOverheadMb).toBe(0);
    expect(sidecarResult.totalMemoryOverheadMb).toBe(1300); // 20 * 65MB
    expect(ciliumResult.hopCount).toBe(3);
    expect(sidecarResult.hopCount).toBe(7);
  });

  it('generiert gültigen eBPF C-Code mit sockops und sk_msg Sektionen', () => {
    const code = generateCiliumEbpfSnippet();
    expect(code).toContain('SEC("sockops")');
    expect(code).toContain('SEC("sk_msg")');
    expect(code).toContain('BPF_MAP_TYPE_SOCKHASH');
    expect(code).toContain('bpf_msg_redirect_hash');
  });
});
