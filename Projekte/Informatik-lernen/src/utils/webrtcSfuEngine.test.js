import { describe, it, expect } from 'vitest';
import { WebRtcMediaTopologySimulator } from './webrtcSfuEngine';

describe('WebRTC Media Topology Engine', () => {
  it('calculates bandwidth and server CPU differences between Mesh, MCU, and SFU', () => {
    const sim = new WebRtcMediaTopologySimulator();
    const res = sim.evaluateTopologies(8);

    // Mesh is not viable for 8 participants
    expect(res.mesh.isViable).toBe(false);
    expect(res.mesh.totalConnections).toBe(28); // 8 * 7 / 2

    // SFU has much lower server CPU than MCU
    expect(res.sfu.serverCpuPercent).toBeLessThan(res.mcu.serverCpuPercent);
    expect(res.sfu.isViable).toBe(true);
  });
});
