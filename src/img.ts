import { isFile } from './is';

const fileToDataURL = (blob: Blob): Promise<any> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = e => resolve((e.target as FileReader).result);
    reader.readAsDataURL(blob);
  });
};
const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataURL;
  });
};
const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> => {
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), type, quality));
};
/**
 * 图片压缩方法
 * @param {Object}  imgFile 图片文件
 * @param {Number} quality 压缩质量参数 0-1
 * @param {String} imgType 想压缩成的文件类型
 * @returns 压缩后的新图片
 */
export const compressionImage = async (imgFile: File, imgType: string, quality = 0.5) => {
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
  const blob = (await canvasToBlob(canvas, toType, quality)) as Blob; // quality:0.5可根据实际情况计算
  return new File([blob], fileName, {
    type: toType
  });
};
