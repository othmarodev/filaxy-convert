function canvasToBMP(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;
  const id = ctx.getImageData(0, 0, w, h);
  const data = id.data;
  const rowSize = Math.ceil((w * 3) / 4) * 4;
  const fileSize = 54 + rowSize * h;
  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setUint32(18, w, true);
  view.setUint32(22, h, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * h, true);
  view.setUint32(38, 2835, true);
  view.setUint32(42, 2835, true);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((h - 1 - y) * w + x) * 4;
      const dstIdx = 54 + y * rowSize + x * 3;
      view.setUint8(dstIdx, data[srcIdx + 2]);
      view.setUint8(dstIdx + 1, data[srcIdx + 1]);
      view.setUint8(dstIdx + 2, data[srcIdx]);
    }
  }

  return new Blob([buf], { type: 'image/bmp' });
}

export function convertImage(file, to, { width, height, quality } = {}, errImageCreate, errImageLoad) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let w = width || img.width;
      let h = height || img.height;

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      if (to === 'ico') {
        canvas.width = 64;
        canvas.height = 64;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let mimeType;
      if (to === 'jpeg' || to === 'jpg') mimeType = 'image/jpeg';
      else if (to === 'webp') mimeType = 'image/webp';
      else mimeType = 'image/png';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(errImageCreate));
            return;
          }
          resolve(to === 'bmp' ? canvasToBMP(canvas, ctx) : blob);
        },
        mimeType,
        (quality || 92) / 100,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(errImageLoad));
    };
    img.src = objectUrl;
  });
}
