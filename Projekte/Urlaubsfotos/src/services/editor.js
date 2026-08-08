// Canvas-based image editor for simple non-destructive edits

export function applyImageEdits(blob, rotation = 0, filters = {}, drawingDataUrl = null, cropArea = null) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate rotated width and height
      const angleRad = (rotation * Math.PI) / 180;
      const is90or270 = Math.abs(rotation % 180) === 90;
      
      const canvasWidth = is90or270 ? img.height : img.width;
      const canvasHeight = is90or270 ? img.width : img.height;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Set CSS filters on canvas context if specified
      let filterString = '';
      if (filters.brightness !== undefined && filters.brightness !== 100) {
        filterString += `brightness(${filters.brightness}%) `;
      }
      if (filters.contrast !== undefined && filters.contrast !== 100) {
        filterString += `contrast(${filters.contrast}%) `;
      }
      if (filters.saturate !== undefined && filters.saturate !== 100) {
        filterString += `saturate(${filters.saturate}%) `;
      }
      if (filters.grayscale) {
        filterString += 'grayscale(100%) ';
      }
      if (filters.sepia) {
        filterString += 'sepia(100%) ';
      }
      
      // Preset filters
      if (filters.preset === 'vintage') {
        filterString += 'sepia(50%) contrast(110%) brightness(95%) ';
      } else if (filters.preset === 'cool') {
        filterString += 'hue-rotate(10deg) saturate(90%) brightness(105%) ';
      } else if (filters.preset === 'warm') {
        filterString += 'sepia(30%) saturate(120%) brightness(100%) ';
      } else if (filters.preset === 'dramatic') {
        filterString += 'contrast(140%) saturate(80%) brightness(90%) ';
      }
      
      if (filterString.trim()) {
        ctx.filter = filterString.trim();
      }
      
      // Center, mirror and rotate
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      
      const scaleX = filters.mirrorHorizontal ? -1 : 1;
      const scaleY = filters.mirrorVertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);
      
      ctx.rotate(angleRad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      // Reset filter and transformations for drawing overlays
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'none';
      
      // Draw drawing overlay if present
      if (drawingDataUrl) {
        const drawImg = new Image();
        drawImg.onload = () => {
          ctx.drawImage(drawImg, 0, 0, canvasWidth, canvasHeight);
          proceedToCropAndExport();
        };
        drawImg.src = drawingDataUrl;
      } else {
        proceedToCropAndExport();
      }

      function proceedToCropAndExport() {
        if (cropArea) {
          // cropArea has { x, y, width, height } in percentage coordinates (0 to 1)
          const cropX = cropArea.x * canvasWidth;
          const cropY = cropArea.y * canvasHeight;
          const cropW = cropArea.width * canvasWidth;
          const cropH = cropArea.height * canvasHeight;

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          exportCanvas(cropCanvas);
        } else {
          exportCanvas(canvas);
        }
      }

      function exportCanvas(targetCanvas) {
        targetCanvas.toBlob((newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, blob.type || 'image/jpeg', 0.92);
      }
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    
    img.src = url;
  });
}

