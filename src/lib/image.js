export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return 'Choose an image file.';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `“${file.name}” is not supported. Use a JPG, PNG, or WebP image.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `“${file.name}” is larger than 8 MB. Choose a smaller file.`;
  }
  return null;
}

function loadImage(file) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The image could not be read. The file may be damaged.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('The image could not be processed.'));
        // Browsers without WebP encoding silently return PNG; JPEG is far smaller.
        if (blob.type !== 'image/webp') {
          canvas.toBlob((jpeg) => (jpeg ? resolve(jpeg) : reject(new Error('The image could not be processed.'))), 'image/jpeg', quality);
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
}

/**
 * Produces a full-size and a thumbnail rendition so pages never load originals.
 */
export async function prepareImage(file, { maxSize = 1920, thumbSize = 640, quality = 0.82 } = {}) {
  const source = await loadImage(file);
  const width = source.width;
  const height = source.height;

  const render = async (limit) => {
    const scale = Math.min(1, limit / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, quality);
    return { blob, width: canvas.width, height: canvas.height };
  };

  const full = await render(maxSize);
  const thumb = await render(thumbSize);
  if (typeof source.close === 'function') source.close();
  return { full, thumb };
}

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(blob);
  });
}

export function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
