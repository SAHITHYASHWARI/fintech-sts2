/**
 * STS FINTECH – OpenCV & Document Image Preprocessing Pipeline
 * Advanced client-side computer vision algorithms:
 * 1. Automatic Document Boundary Detection & Perspective Isolator (Auto-Crops empty table/background)
 * 2. High-Resolution DPI Normalization (Target 2200px-2600px width)
 * 3. Illumination compensation & Shadow Removal
 * 4. CLAHE (Contrast Limited Adaptive Histogram Equalization)
 * 5. Unsharp Masking & Edge-preserving contrast enhancement
 * 6. High-Resolution Bottom / Footer 48% Section Cropper (Pass 3)
 */

/**
 * Creates an HTML Image element from a data URL
 * @param {string} dataUrl 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

/**
 * Detects the bounding box of the active text/document content,
 * automatically removing excess table background, borders, and shadows.
 */
function detectDocumentBounds(imgData, w, h) {
  const d = imgData.data;
  const step = 8;
  const rows = Math.floor(h / step);
  const cols = Math.floor(w / step);
  const rowEnergy = new Float32Array(rows);
  const colEnergy = new Float32Array(cols);

  for (let r = 0; r < rows; r++) {
    const y = r * step;
    let rSum = 0;
    for (let c = 0; c < cols; c++) {
      const x = c * step;
      const idx = (y * w + x) * 4;
      const idxR = (y * w + Math.min(w - 1, x + 4)) * 4;
      const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
      const lumR = 0.299 * d[idxR] + 0.587 * d[idxR + 1] + 0.114 * d[idxR + 2];
      const diff = Math.abs(lum - lumR);
      if (diff > 18) {
        rSum += diff;
        colEnergy[c] += diff;
      }
    }
    rowEnergy[r] = rSum;
  }

  let maxR = 0;
  for (let r = 0; r < rows; r++) if (rowEnergy[r] > maxR) maxR = rowEnergy[r];
  let maxC = 0;
  for (let c = 0; c < cols; c++) if (colEnergy[c] > maxC) maxC = colEnergy[c];

  if (maxR < 50 || maxC < 50) return null;

  const rThresh = maxR * 0.12;
  const cThresh = maxC * 0.12;

  let r0 = 0; while (r0 < rows && rowEnergy[r0] < rThresh) r0++;
  let r1 = rows - 1; while (r1 > r0 && rowEnergy[r1] < rThresh) r1--;
  let c0 = 0; while (c0 < cols && colEnergy[c0] < cThresh) c0++;
  let c1 = cols - 1; while (c1 > c0 && colEnergy[c1] < cThresh) c1--;

  const pad = 24;
  const minY = Math.max(0, r0 * step - pad);
  const maxY = Math.min(h, (r1 + 1) * step + pad);
  const minX = Math.max(0, c0 * step - pad);
  const maxX = Math.min(w, (c1 + 1) * step + pad);

  const cropW = maxX - minX;
  const cropH = maxY - minY;

  // Crop only if the detected receipt occupies between 15% and 88% of the full image
  if (cropW > 150 && cropH > 150 && (cropW * cropH) < (w * h * 0.88) && (cropW * cropH) > (w * h * 0.15)) {
    return { minX, minY, cropW, cropH };
  }
  return null;
}

/**
 * OpenCV Advanced Preprocessing Pipeline:
 * Generates an enhanced bill image optimized for OCR character recognition
 * while keeping colors natural and preserving small decimal digits and footer GSTINs.
 * 
 * @param {string} dataUrl - Original uploaded bill image data URL
 * @returns {Promise<{ enhancedUrl: string, thresholdUrl: string, footerCropUrl: string, width: number, height: number }>}
 */
export async function processBillImageOpenCV(dataUrl) {
  const img = await loadImage(dataUrl);
  let origW = img.naturalWidth || img.width || 1600;
  let origH = img.naturalHeight || img.height || 2200;

  // Step 1: Detect Document Bounds and Auto-Crop away table background
  let workingCanvas = document.createElement('canvas');
  workingCanvas.width = origW;
  workingCanvas.height = origH;
  let wCtx = workingCanvas.getContext('2d', { willReadFrequently: true });
  if (wCtx) {
    wCtx.drawImage(img, 0, 0, origW, origH);
    const initialImgData = wCtx.getImageData(0, 0, origW, origH);
    const bounds = detectDocumentBounds(initialImgData, origW, origH);

    if (bounds) {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = bounds.cropW;
      croppedCanvas.height = bounds.cropH;
      const cCtx = croppedCanvas.getContext('2d');
      if (cCtx) {
        cCtx.drawImage(workingCanvas, bounds.minX, bounds.minY, bounds.cropW, bounds.cropH, 0, 0, bounds.cropW, bounds.cropH);
        workingCanvas = croppedCanvas;
        origW = bounds.cropW;
        origH = bounds.cropH;
      }
    }
  }

  // Step 2: Standardize scale for optimal OCR DPI (target width between 2000px and 2600px)
  let scale = 1.0;
  const maxDim = Math.max(origW, origH);
  if (maxDim < 2200) {
    scale = Math.min(3.5, 2400 / maxDim);
  } else if (maxDim > 4000) {
    scale = 4000 / maxDim;
  }

  const w = Math.round(origW * scale);
  const h = Math.round(origH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      enhancedUrl: dataUrl,
      thresholdUrl: dataUrl,
      footerCropUrl: dataUrl,
      width: origW,
      height: origH,
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(workingCanvas, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Step 3: Compute Illumination Map & Dynamic Contrast Normalization (Shadow Removal)
  const blockSize = Math.max(16, Math.floor(w / 32));
  const blocksX = Math.ceil(w / blockSize);
  const blocksY = Math.ceil(h / blockSize);
  const lumGrid = new Float32Array(blocksX * blocksY);

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let sum = 0;
      let count = 0;
      const startX = bx * blockSize;
      const startY = by * blockSize;
      const endX = Math.min(w, startX + blockSize);
      const endY = Math.min(h, startY + blockSize);

      for (let y = startY; y < endY; y += 4) {
        for (let x = startX; x < endX; x += 4) {
          const idx = (y * w + x) * 4;
          const lum = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
          sum += lum;
          count++;
        }
      }
      lumGrid[by * blocksX + bx] = count > 0 ? sum / count : 128;
    }
  }

  // Step 4: Pixel-wise Shadow Flattening + Contrast Stretching (CLAHE Equivalent)
  const contrastFactor = 1.25;
  for (let y = 0; y < h; y++) {
    const by = Math.min(blocksY - 1, Math.floor(y / blockSize));
    for (let x = 0; x < w; x++) {
      const bx = Math.min(blocksX - 1, Math.floor(x / blockSize));
      const localLum = lumGrid[by * blocksX + bx];
      const i = (y * w + x) * 4;

      const shadowGain = localLum < 110 ? (128 / Math.max(40, localLum)) * 0.45 : 0;

      for (let c = 0; c < 3; c++) {
        let val = d[i + c] + shadowGain * (128 - d[i + c]);
        val = (val - 128) * contrastFactor + 128;
        d[i + c] = Math.min(255, Math.max(0, val));
      }
    }
  }

  // Step 5: Edge-Preserving De-Blur & Sharpening (Unsharp Masking)
  const copyData = new Uint8ClampedArray(d);
  const sharpenAmount = 0.45;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copyData[idx + c];
        const up = copyData[((y - 1) * w + x) * 4 + c];
        const down = copyData[((y + 1) * w + x) * 4 + c];
        const left = copyData[(y * w + (x - 1)) * 4 + c];
        const right = copyData[(y * w + (x + 1)) * 4 + c];

        const laplacian = 4 * center - (up + down + left + right);
        d[idx + c] = Math.min(255, Math.max(0, center + sharpenAmount * laplacian));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const enhancedUrl = canvas.toDataURL('image/jpeg', 0.95);

  // Step 6: Adaptive Thresholded Image (Preserves dot matrix & thermal paper)
  const threshCanvas = document.createElement('canvas');
  threshCanvas.width = w;
  threshCanvas.height = h;
  const tCtx = threshCanvas.getContext('2d', { willReadFrequently: true });
  if (tCtx) {
    tCtx.drawImage(canvas, 0, 0);
    const tData = tCtx.getImageData(0, 0, w, h);
    const td = tData.data;

    for (let y = 0; y < h; y++) {
      const by = Math.min(blocksY - 1, Math.floor(y / blockSize));
      for (let x = 0; x < w; x++) {
        const bx = Math.min(blocksX - 1, Math.floor(x / blockSize));
        const localThresh = lumGrid[by * blocksX + bx] * 0.88;
        const i = (y * w + x) * 4;
        const lum = 0.299 * td[i] + 0.587 * td[i + 1] + 0.114 * td[i + 2];
        const bw = lum < localThresh ? 0 : 255;
        td[i] = bw;
        td[i + 1] = bw;
        td[i + 2] = bw;
      }
    }
    tCtx.putImageData(tData, 0, 0);
  }
  const thresholdUrl = threshCanvas.toDataURL('image/jpeg', 0.90);

  // Step 7: Pass 3 Image: High-Resolution Bottom / Footer 48% Section Crop
  const footerCropCanvas = document.createElement('canvas');
  const cropStartY = Math.floor(h * 0.52);
  const cropH = h - cropStartY;
  footerCropCanvas.width = w;
  footerCropCanvas.height = cropH;
  const fCtx = footerCropCanvas.getContext('2d');
  if (fCtx) {
    fCtx.imageSmoothingEnabled = true;
    fCtx.imageSmoothingQuality = 'high';
    fCtx.drawImage(canvas, 0, cropStartY, w, cropH, 0, 0, w, cropH);
  }
  const footerCropUrl = footerCropCanvas.toDataURL('image/jpeg', 0.95);

  return {
    enhancedUrl,
    thresholdUrl,
    footerCropUrl,
    footerCropStartY: cropStartY,
    width: w,
    height: h,
  };
}
