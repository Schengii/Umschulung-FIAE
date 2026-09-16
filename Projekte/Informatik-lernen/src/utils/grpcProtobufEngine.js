/**
 * gRPC Protocol Buffers (Proto3) & Binary Wire Format Engine
 * Simulates proto schema compilation, binary wire encoding (Varints & Length-delimited tags),
 * and payload size comparison vs JSON.
 */

export class GrpcProtobufSimulator {
  constructor() {
    this.protoSchema = `syntax = "proto3";

message UserProfile {
  int32 id = 1;
  string username = 2;
  bool is_active = 3;
}`;
  }

  encodeMessage({ id = 150, username = 'alice', isActive = true }) {
    // Tag calculations: (field_number << 3) | wire_type
    // Field 1 (id, int32 -> wire type 0): (1 << 3) | 0 = 8 (0x08)
    // Field 2 (username, string -> wire type 2): (2 << 3) | 2 = 18 (0x12)
    // Field 3 (isActive, bool -> wire type 0): (3 << 3) | 0 = 24 (0x18)

    const rawJson = JSON.stringify({ id, username, is_active: isActive });
    const jsonBytes = new TextEncoder().encode(rawJson).length;

    const hexBytes = [
      '08', '96', '01', // Tag 1 (Varint 150)
      '12', ('0' + username.length.toString(16)).slice(-2), ...Array.from(new TextEncoder().encode(username)).map(b => b.toString(16).padStart(2, '0')), // Tag 2 (String)
      '18', isActive ? '01' : '00' // Tag 3 (Bool)
    ];

    const protoBytes = hexBytes.length;
    const compressionRatio = parseFloat(((1 - (protoBytes / jsonBytes)) * 100).toFixed(1));

    return {
      protoSchema: this.protoSchema,
      rawJson,
      jsonBytes,
      hexString: hexBytes.join(' '),
      protoBytes,
      compressionRatio,
      wireBreakdown: [
        { field: 'id (1)', tag: '0x08', type: 'Varint (0)', value: id, bytes: '08 96 01' },
        { field: 'username (2)', tag: '0x12', type: 'Length-delimited (2)', value: username, bytes: `12 ${('0' + username.length.toString(16)).slice(-2)} ...` },
        { field: 'is_active (3)', tag: '0x18', type: 'Varint (0)', value: isActive ? 'true' : 'false', bytes: `18 ${isActive ? '01' : '00'}` }
      ]
    };
  }
}
