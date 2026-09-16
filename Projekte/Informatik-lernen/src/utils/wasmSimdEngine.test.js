import { describe, it, expect } from 'vitest';
import {
  simdAddF32x4,
  simdMulF32x4,
  simdDotProductF32x4,
  simdBrightnessU8x16,
  simdMatrixMul4x4,
  runSimdBenchmark,
  generateWatSimdSnippet,
  applySimdConvolutionFilter,
  CONVOLUTION_KERNELS
} from './wasmSimdEngine';

describe('wasmSimdEngine', () => {
  it('should correctly execute parallel 4-lane Float32 addition', () => {
    const vecA = [1.5, 2.0, 3.25, 4.0];
    const vecB = [0.5, 3.0, 0.75, -2.0];
    const res = simdAddF32x4(vecA, vecB);

    expect(res).toEqual([2.0, 5.0, 4.0, 2.0]);
  });

  it('should correctly execute parallel 4-lane Float32 multiplication', () => {
    const vecA = [2.0, 3.0, 4.0, 5.0];
    const vecB = [3.0, 4.0, 0.5, -2.0];
    const res = simdMulF32x4(vecA, vecB);

    expect(res).toEqual([6.0, 12.0, 2.0, -10.0]);
  });

  it('should calculate accurate dot product', () => {
    const vecA = [1, 2, 3, 4];
    const vecB = [5, 6, 7, 8];
    // (1*5) + (2*6) + (3*7) + (4*8) = 5 + 12 + 21 + 32 = 70
    const dot = simdDotProductF32x4(vecA, vecB);
    expect(dot).toBe(70);
  });

  it('should apply Uint8x16 brightness filter and clamp to [0, 255]', () => {
    const bytes = [10, 250, 100, 0, 50, 200, 240, 120, 10, 20, 30, 40, 50, 60, 70, 80];
    const result = simdBrightnessU8x16(bytes, 20);

    expect(result[0]).toBe(30);
    expect(result[1]).toBe(255); // clamped from 270
    expect(result[3]).toBe(20);
    expect(result.length).toBe(16);
  });

  it('should perform 4x4 matrix multiplication', () => {
    // Identity matrix
    const identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    const mat = [
      2, 3, 1, 5,
      4, 1, 0, 2,
      3, 2, 4, 1,
      1, 1, 1, 1
    ];

    const result = simdMatrixMul4x4(mat, identity);
    expect(result).toEqual(mat);
  });

  it('should run benchmark and measure speedup and MFLOPS', () => {
    const bench = runSimdBenchmark(10000, 'add');
    expect(bench.itemCount).toBe(10000);
    expect(bench.speedup).toBeGreaterThan(1);
    expect(bench.isVerified).toBe(true);
  });

  it('should generate valid WAT snippet with v128 instructions', () => {
    const wat = generateWatSimdSnippet('f32x4.mul');
    expect(wat).toContain('v128.load');
    expect(wat).toContain('f32x4.mul');
    expect(wat).toContain('v128.store');
  });

  it('should compute 3x3 convolution matrix Sobel edge filter', () => {
    const width = 8;
    const height = 8;
    const pixels = new Uint8Array(width * height);
    // Erstelle ein klares Rechteck für Kantendetektion
    for (let y = 2; y < 6; y++) {
      for (let x = 2; x < 6; x++) {
        pixels[y * width + x] = 200;
      }
    }

    const res = applySimdConvolutionFilter(pixels, width, height, 'sobel');
    expect(res.totalPixels).toBe(64);
    expect(res.output.length).toBe(64);
    expect(res.speedup).toBeGreaterThan(1);
    expect(CONVOLUTION_KERNELS.sobelX).toBeDefined();
    expect(CONVOLUTION_KERNELS.gaussianBlur).toBeDefined();
  });
});
