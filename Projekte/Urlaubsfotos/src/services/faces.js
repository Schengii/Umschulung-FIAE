// Dynamically loads tracking.js and runs face detection client-side

let trackingPromise = null;
let sharedCanvas = null;

function getSharedCanvas() {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }
  return sharedCanvas;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function initTracking() {
  if (trackingPromise) return trackingPromise;
  
  trackingPromise = (async () => {
    try {
      // Load tracking core
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js');
      // Load face classifier
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/data/face-min.js');
      
      if (!window.tracking) {
        throw new Error('tracking.js failed to load globally.');
      }
    } catch (err) {
      console.error('Error loading tracking.js:', err);
      trackingPromise = null;
      throw err;
    }
  })();
  return trackingPromise;
}

export async function detectFaces(file) {
  return new Promise(async (resolve) => {
    try {
      await initTracking();
      
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = getSharedCanvas();
        const ctx = canvas.getContext('2d');
        
        // Standardize size to speed up face detection
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        
        try {
          const tracker = new window.tracking.ObjectTracker('face');
          tracker.setStepSize(1.7);
          
          const task = window.tracking.track(canvas, tracker);
          
          tracker.once('track', (event) => {
            task.stop();
            
            if (!event.data || event.data.length === 0) {
              resolve([]);
              return;
            }
            
            const faces = event.data.map((rect, idx) => {
              // Crop face from canvas
              const faceCanvas = document.createElement('canvas');
              const faceCtx = faceCanvas.getContext('2d');
              
              // Padding around face bounding box
              const padding = Math.round(rect.width * 0.15);
              const sx = Math.max(0, rect.x - padding);
              const sy = Math.max(0, rect.y - padding);
              const sw = Math.min(w - sx, rect.width + padding * 2);
              const sh = Math.min(h - sy, rect.height + padding * 2);
              
              faceCanvas.width = 100;
              faceCanvas.height = 100;
              faceCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 100, 100);
              
              return {
                id: `face-${idx}-${Math.random().toString(36).substring(2, 6)}`,
                box: rect,
                thumbnail: faceCanvas.toDataURL('image/jpeg', 0.8),
                name: '' // Initially unnamed
              };
            });
            
            resolve(faces);
          });
        } catch (err) {
          console.error('Face tracking failed:', err);
          resolve([]);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([]);
      };
      
      img.src = url;
    } catch (err) {
      console.error('Face detector failed:', err);
      resolve([]);
    }
  });
}
