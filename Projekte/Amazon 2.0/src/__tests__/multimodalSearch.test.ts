import { describe, it, expect } from 'vitest';
import { searchMultimodalHybrid } from '../utils/multimodalSearch';
import { state } from '../store';

describe('Multimodal Visual & Audio Search Engine', () => {
  it('combines camera spectrogram and acoustic features for product identification', () => {
    const res = searchMultimodalHybrid(state.products, true);
    expect(res.product).toBeDefined();
    expect(res.visualConfidencePercent).toBeGreaterThan(90);
    expect(res.audioConfidencePercent).toBeGreaterThan(90);
    expect(res.combinedMatchPercent).toBeGreaterThan(90);
    expect(res.detectedVisualTags.length).toBeGreaterThan(0);
  });
});
