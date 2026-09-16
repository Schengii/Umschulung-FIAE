import { describe, it, expect } from 'vitest';
import { GrpcProtobufSimulator } from './grpcProtobufEngine';

describe('gRPC Protobuf Wire Format Engine', () => {
  it('encodes message into binary wire format with significant byte size savings vs JSON', () => {
    const sim = new GrpcProtobufSimulator();
    const res = sim.encodeMessage({ id: 150, username: 'alice', isActive: true });

    expect(res.protoBytes).toBeLessThan(res.jsonBytes);
    expect(res.compressionRatio).toBeGreaterThan(50);
    expect(res.hexString).toContain('08 96 01');
    expect(res.wireBreakdown.length).toBe(3);
  });
});
