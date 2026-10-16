// ============================================================
// Amazon 2.0 – Bitcoin Lightning Micro-Payment Streaming Engine
// ============================================================

export interface LightningChannelState {
  nodeAlias: string;
  balanceSats: number;
  channelCapacitySats: number;
  streamingRateSatsPerSec: number;
  totalStreamedSats: number;
  isStreaming: boolean;
}

export function getInitialLightningState(): LightningChannelState {
  return {
    nodeAlias: '03a8f...amz-lightning-node.lnd',
    balanceSats: 250000,
    channelCapacitySats: 1000000,
    streamingRateSatsPerSec: 25,
    totalStreamedSats: 0,
    isStreaming: false,
  };
}

export function streamSatsTick(state: LightningChannelState): LightningChannelState {
  const next = { ...state };
  if (next.balanceSats >= next.streamingRateSatsPerSec) {
    next.balanceSats -= next.streamingRateSatsPerSec;
    next.totalStreamedSats += next.streamingRateSatsPerSec;
  }
  return next;
}
