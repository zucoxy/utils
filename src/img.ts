import { isFile } from './is';

const fileToDataURL = (blob: Blob): Promise<string> => {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onloadend = e => resolve((e.target as FileReader).result as string);
    reader.readAsDataURL(blob);
  });
};

const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataURL;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> => {
  return new Promise<Blob | null>(resolve => canvas.toBlob(blob => resolve(blob), type, quality));
};

/**
 * 图片压缩（基于 canvas，需浏览器环境）
 * @param imgFile 图片文件
 * @param imgType 目标类型，如 `'image/jpeg'`，为空时取源文件类型
 * @param quality 压缩质量 0-1，默认 0.5
 * @returns 压缩后的新 `File`；入参不是 `File` 时原样返回
 * @example
 * const file = await compressionImage(input.files[0], 'image/jpeg', 0.6);
 */
export const compressionImage = async (imgFile: File, imgType: string, quality = 0.5): Promise<File> => {
  if (!isFile(imgFile)) {
    console.warn('type Error: imgFile excepted to be File');
    return imgFile;
  }
  const fileName = imgFile.name;
  const toType = imgType || imgFile.type || 'image/jpeg';
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const base64 = await fileToDataURL(imgFile);
  const image = await dataURLToImage(base64);
  canvas.width = image.width;
  canvas.height = image.height;
  context.clearRect(0, 0, image.width, image.height);
  context.drawImage(image, 0, 0, image.width, image.height);
  const blob = (await canvasToBlob(canvas, toType, quality)) as Blob;
  return new File([blob], fileName, {
    type: toType,
  });
};
