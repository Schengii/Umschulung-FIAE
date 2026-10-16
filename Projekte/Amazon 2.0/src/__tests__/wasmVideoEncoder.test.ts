import { describe, it, expect } from 'vitest';
import { processAndEncodeVideo } from '../utils/wasmVideoEncoder';

describe('WebAssembly Video-Encoder & Compression Pipeline', () => {
  it('encodes and compresses video with high efficiency', async () => {
    const dummyBlob = { size: 1024 * 1024 * 30, name: 'review.mp4' };
    const res = await processAndEncodeVideo(dummyBlob, {
      codec: 'av1-wasm',
      filter: 'studio',
      targetResolution: '1080p',
      watermark: true,
    });

    expect(res.originalSizeBytes).toBe(dummyBlob.size);
    expect(res.compressedSizeBytes).toBeLessThan(res.originalSizeBytes);
    expect(res.compressionRatioPercent).toBeGreaterThan(70);
    expect(res.codecUsed).toBe('av1-wasm');
  });
});
