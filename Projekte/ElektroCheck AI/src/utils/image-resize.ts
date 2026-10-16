/** Obergrenze für Base64-Bilder; das Backend (Vercel) akzeptiert Request-Bodies bis 4,5 MB. */
const MAX_IMAGE_DATA_URL_LENGTH = 3_800_000;

/** Skaliert Maße proportional, sodass die längere Seite höchstens maxSide beträgt (kein Hochskalieren). */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function drawToJpeg(bitmap: ImageBitmap, maxSide: number, quality: number): string {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");
  ctx.fillStyle = "#ffffff"; // PNGs mit Transparenz sonst schwarz
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Verkleinert ein Bild (Datei/Blob) vor dem Upload zu einer JPEG-Data-URL.
 * Berücksichtigt die EXIF-Ausrichtung und verkleinert notfalls weiter, bis das Backend-Limit eingehalten ist.
 * Kann das Bild nicht dekodiert werden, wird es unverändert als Data-URL zurückgegeben.
 */
export async function resizeImage(
  source: Blob,
  options: { maxSide?: number; quality?: number } = {},
): Promise<string> {
  let maxSide = options.maxSide ?? 1600;
  let quality = options.quality ?? 0.82;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    return readAsDataUrl(source);
  }

  try {
    let dataUrl = drawToJpeg(bitmap, maxSide, quality);
    for (let attempt = 0; attempt < 4 && dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH; attempt++) {
      quality = Math.max(0.5, quality - 0.1);
      maxSide = Math.round(maxSide * 0.8);
      dataUrl = drawToJpeg(bitmap, maxSide, quality);
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
