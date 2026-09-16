import { describe, it, expect } from 'vitest';
import {
  createPeerInstance,
  generateSdpOffer,
  generateSdpAnswer,
  generateIceCandidates,
  simulateDataChannelTransmit
} from './webrtcPeerEngine';

describe('WebRTC Peer-to-Peer & DataChannel Engine', () => {
  it('initializes peer instance with stable state', () => {
    const peer = createPeerInstance('peer_a', 'Alice');
    expect(peer.id).toBe('peer_a');
    expect(peer.name).toBe('Alice');
    expect(peer.signalingState).toBe('stable');
    expect(peer.iceConnectionState).toBe('new');
    expect(peer.dataChannel.state).toBe('connecting');
  });

  it('generates valid SDP Offer with DTLS/SCTP datachannel and ICE parameters', () => {
    const offer = generateSdpOffer('peer_a');
    expect(offer.type).toBe('offer');
    expect(offer.sdp).toContain('v=0');
    expect(offer.sdp).toContain('m=application 9 DTLS/SCTP 5000');
    expect(offer.sdp).toContain('a=ice-ufrag:');
    expect(offer.sdp).toContain('a=fingerprint:sha-256');
  });

  it('generates valid SDP Answer responding to offer', () => {
    const answer = generateSdpAnswer('peer_b', 'mock-offer-sdp');
    expect(answer.type).toBe('answer');
    expect(answer.sdp).toContain('a=setup:active');
    expect(answer.sdp).toContain('m=application 9 DTLS/SCTP 5000');
  });

  it('generates 3 types of ICE Candidates (Host, STUN srflx, TURN relay)', () => {
    const candidates = generateIceCandidates('Alice');
    expect(candidates.length).toBe(3);

    const types = candidates.map(c => c.type);
    expect(types).toContain('host');
    expect(types).toContain('srflx');
    expect(types).toContain('relay');
  });

  it('simulates DataChannel transmission with latency and optional drop rate', () => {
    const packet = simulateDataChannelTransmit({
      message: 'Hello Peer!',
      senderName: 'Alice',
      latencyMs: 40,
      dropRatePercent: 0
    });

    expect(packet.text).toBe('Hello Peer!');
    expect(packet.sender).toBe('Alice');
    expect(packet.latencyMs).toBe(40);
    expect(packet.isDropped).toBe(false);
    expect(packet.status).toContain('DELIVERED');
  });
});
