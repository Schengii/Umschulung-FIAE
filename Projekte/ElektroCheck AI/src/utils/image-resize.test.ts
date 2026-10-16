import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fitWithin, resizeImage } from './image-resize';

describe('fitWithin', () => {
  it('lässt kleine Bilder unverändert', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it('skaliert Querformat proportional auf die längere Seite', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it('skaliert Hochformat proportional', () => {
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('liefert mindestens 1 Pixel pro Seite', () => {
    expect(fitWithin(10000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
});

describe('resizeImage', () => {
  const originalDocument = globalThis.document;
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalFileReader = globalThis.FileReader;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.createImageBitmap = originalCreateImageBitmap;
    globalThis.FileReader = originalFileReader;
  });

  it('fällt auf readAsDataUrl zurück, wenn createImageBitmap fehlschlägt', async () => {
    class MockFileReader {
      result: string = 'data:image/png;base64,fallback-data';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    (globalThis as unknown as Record<string, unknown>).FileReader = MockFileReader;
    (globalThis as unknown as Record<string, unknown>).createImageBitmap = vi.fn().mockRejectedValue(new Error('Decode failed'));

    const dummyBlob = new Blob(['sample-bytes'], { type: 'image/png' });
    const result = await resizeImage(dummyBlob);

    expect(result).toBe('data:image/png;base64,fallback-data');
  });

  it('skaliert Bild über Canvas und schließt die Bitmap', async () => {
    const mockBitmap = {
      width: 3200,
      height: 2400,
      close: vi.fn(),
    };
    (globalThis as unknown as Record<string, unknown>).createImageBitmap = vi.fn().mockResolvedValue(mockBitmap);

    const mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,resized-data'),
    };

    (globalThis as unknown as Record<string, unknown>).document = {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    };

    const dummyBlob = new Blob(['sample-bytes'], { type: 'image/jpeg' });
    const result = await resizeImage(dummyBlob, { maxSide: 1600, quality: 0.8 });

    expect(result).toBe('data:image/jpeg;base64,resized-data');
    expect(mockCanvas.width).toBe(1600);
    expect(mockCanvas.height).toBe(1200);
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1600, 1200);
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockBitmap, 0, 0, 1600, 1200);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    expect(mockBitmap.close).toHaveBeenCalledTimes(1);
  });

  it('reduziert Qualität und Abmessungen iterativ, wenn Bild das Limit überschreitet', async () => {
    const mockBitmap = {
      width: 4000,
      height: 3000,
      close: vi.fn(),
    };
    (globalThis as unknown as Record<string, unknown>).createImageBitmap = vi.fn().mockResolvedValue(mockBitmap);

    const mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };

    // First call returns an oversized string > 3.8MB, second call returns a smaller string
    let callCount = 0;
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return 'data:image/jpeg;base64,' + 'X'.repeat(4_000_000);
        }
        return 'data:image/jpeg;base64,compressed-small';
      }),
    };

    (globalThis as unknown as Record<string, unknown>).document = {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    };

    const dummyBlob = new Blob(['bytes'], { type: 'image/jpeg' });
    const result = await resizeImage(dummyBlob, { maxSide: 2000, quality: 0.82 });

    expect(result).toBe('data:image/jpeg;base64,compressed-small');
    expect(callCount).toBe(2);
    expect(mockBitmap.close).toHaveBeenCalledTimes(1);
  });
});

