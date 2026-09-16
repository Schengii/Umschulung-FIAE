/**
 * WebRTC Media Server Architecture Engine (Mesh vs. MCU vs. SFU Simulcast)
 * Calculates uplink/downlink stream counts, server transcoding overhead,
 * and client CPU/bandwidth consumption for multi-party video conferencing.
 */

export class WebRtcMediaTopologySimulator {
  constructor() {
    this.participantCount = 6;
  }

  evaluateTopologies(n = this.participantCount) {
    const count = Math.max(2, n);

    // 1. Full Mesh P2P
    const meshUploadStreamsPerClient = count - 1;
    const meshDownloadStreamsPerClient = count - 1;
    const meshTotalPeerConnections = (count * (count - 1)) / 2;
    const meshClientBandwidthKbps = meshUploadStreamsPerClient * 1500 + meshDownloadStreamsPerClient * 1500;

    // 2. MCU (Mixed)
    const mcuUploadPerClient = 1;
    const mcuDownloadPerClient = 1;
    const mcuServerCpuLoadPercent = Math.min(100, count * 15); // High transcoding load
    const mcuClientBandwidthKbps = 1500 + 2000;

    // 3. SFU (Simulcast Forwarding)
    const sfuUploadPerClient = 3; // 3 Simulcast layers: High (720p), Med (360p), Low (180p)
    const sfuDownloadPerClient = count - 1; // Adaptive layer forwarding
    const sfuServerCpuLoadPercent = Math.min(100, count * 2); // Low forwarding-only load
    const sfuClientBandwidthKbps = 2500 + (count - 1) * 600;

    return {
      participantCount: count,
      mesh: {
        totalConnections: meshTotalPeerConnections,
        uploadStreams: meshUploadStreamsPerClient,
        downloadStreams: meshDownloadStreamsPerClient,
        clientBandwidthKbps: meshClientBandwidthKbps,
        isViable: count <= 4,
        recommendation: count <= 4 ? 'Optimal für kleine 1:1 oder 3er Calls' : 'Überlastung des Client-Uplinks!'
      },
      mcu: {
        uploadStreams: mcuUploadPerClient,
        downloadStreams: mcuDownloadPerClient,
        serverCpuPercent: mcuServerCpuLoadPercent,
        clientBandwidthKbps: mcuClientBandwidthKbps,
        isViable: true,
        recommendation: 'Hohe Server-Transcoding-Kosten, aber minimaler Client-Traffic'
      },
      sfu: {
        uploadStreams: sfuUploadPerClient,
        downloadStreams: sfuDownloadPerClient,
        serverCpuPercent: sfuServerCpuLoadPercent,
        clientBandwidthKbps: sfuClientBandwidthKbps,
        isViable: true,
        recommendation: 'Industrie-Standard (Zoom/Teams): Skalierbar bis Hunderte Teilnehmer'
      }
    };
  }
}
