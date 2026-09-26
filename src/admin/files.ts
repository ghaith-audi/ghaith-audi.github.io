export interface ProcessedFile {
  base64: string;
  dataUrl: string;
  ext: string;
  width?: number;
  height?: number;
  bytes: number;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Resizes an image in the browser and encodes it as WebP (JPEG where WebP encoding isn't available). */
export async function processImage(file: File, maxWidth: number, maxHeight = 8000): Promise<ProcessedFile> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (PNG, JPG or WebP).');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.min(Math.round(bitmap.height * scale), maxHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process images.');
  ctx.drawImage(bitmap, 0, 0, width, Math.round(bitmap.height * scale));
  bitmap.close();
  let blob = await canvasBlob(canvas, 'image/webp', 0.82);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasBlob(canvas, 'image/jpeg', 0.86);
    ext = 'jpg';
  }
  if (!blob) throw new Error('The image could not be encoded.');
  const dataUrl = await blobToDataUrl(blob);
  return { base64: dataUrl.slice(dataUrl.indexOf(',') + 1), dataUrl, ext, width, height, bytes: blob.size };
}

/** Reads a PDF as base64 without changing it. */
export async function processPdf(file: File, maxBytes = 8 * 1024 * 1024): Promise<ProcessedFile> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Choose a PDF file.');
  if (file.size > maxBytes) throw new Error('The PDF is larger than 8 MB. Export a smaller version and try again.');
  const dataUrl = await blobToDataUrl(file);
  return { base64: dataUrl.slice(dataUrl.indexOf(',') + 1), dataUrl, ext: 'pdf', bytes: file.size };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
