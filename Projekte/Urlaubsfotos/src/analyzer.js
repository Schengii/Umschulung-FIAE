import EXIF from 'exif-js';

let sharedCanvas = null;

function getSharedCanvas() {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }
  return sharedCanvas;
}

// Parses EXIF metadata from a File object
export function getExifData(file) {
  return new Promise((resolve) => {
    EXIF.getData(file, function () {
      const tags = EXIF.getAllTags(this) || {};
      
      // Parse Date
      let date = null;
      if (tags.DateTimeOriginal) {
        // Format: "YYYY:MM:DD HH:MM:SS" -> Date object
        const parts = tags.DateTimeOriginal.split(/[: ]/);
        if (parts.length >= 6) {
          date = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(parts[3]),
            parseInt(parts[4]),
            parseInt(parts[5])
          );
        }
      }
      if (!date && file.lastModified) {
        date = new Date(file.lastModified);
      }
      if (!date) {
        date = new Date();
      }

      // Parse GPS
      let location = null;
      if (tags.GPSLatitude && tags.GPSLongitude) {
        const lat = convertDMSToDD(
          tags.GPSLatitude,
          tags.GPSLatitudeRef
        );
        const lng = convertDMSToDD(
          tags.GPSLongitude,
          tags.GPSLongitudeRef
        );
        location = {
          latitude: lat,
          longitude: lng,
          name: tags.GPSAreaInformation || tags.GPSDestDistanceRef || ''
        };
      }

      const iso = Array.isArray(tags.ISOSpeedRatings) ? tags.ISOSpeedRatings[0] : tags.ISOSpeedRatings;

      resolve({
        date: date.toISOString(),
        location,
        camera: tags.Model || tags.Make || 'Unknown Camera',
        iso: iso || null,
        exposureTime: formatExposureTime(tags.ExposureTime),
        aperture: formatAperture(tags.FNumber),
        focalLength: formatFocalLength(tags.FocalLength),
        flash: formatFlash(tags.Flash)
      });
    });
  });
}

function formatExposureTime(value) {
  if (!value) return null;
  if (typeof value === 'object') {
    const num = value.numerator || 0;
    const den = value.denominator || 1;
    if (num === 0) return null;
    return num === 1 ? `1/${den}` : `${(num/den).toFixed(3)}s`;
  }
  if (typeof value === 'number') {
    if (value >= 0.25) return `${value}s`;
    const reciprocal = Math.round(1 / value);
    return `1/${reciprocal}`;
  }
  return String(value);
}

function formatAperture(value) {
  if (!value) return null;
  if (typeof value === 'object') {
    return (value.numerator / value.denominator).toFixed(1);
  }
  return Number(value).toFixed(1);
}

function formatFocalLength(value) {
  if (!value) return null;
  if (typeof value === 'object') {
    return Math.round(value.numerator / value.denominator);
  }
  return Math.round(Number(value));
}

function formatFlash(value) {
  if (value === undefined || value === null) return null;
  const val = Number(value);
  return (val & 1) === 1 ? 'Ausgelöst' : 'Nicht ausgelöst';
}

// Convert Degrees Minutes Seconds (EXIF format) to Decimal Degrees
function convertDMSToDD(dms, ref) {
  if (!dms || dms.length < 3) return 0;
  
  // dms can be arrays of custom EXIF Number objects or simple numbers
  const degrees = typeof dms[0] === 'object' ? dms[0].numerator / dms[0].denominator : dms[0];
  const minutes = typeof dms[1] === 'object' ? dms[1].numerator / dms[1].denominator : dms[1];
  const seconds = typeof dms[2] === 'object' ? dms[2].numerator / dms[2].denominator : dms[2];

  let dd = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    dd = -dd;
  }
  return dd;
}

// Analyzes the image sharpness (blur detection) and brightness
export function analyzeImageQuality(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = getSharedCanvas();
      const ctx = canvas.getContext('2d');
      
      // Standardize size for fast processing
      const maxDim = 250;
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
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        
        // 1. Calculate average brightness
        let totalBrightness = 0;
        const pixelsCount = w * h;
        
        // Grayscale values list
        const gray = new Float32Array(pixelsCount);
        
        for (let i = 0; i < pixelsCount; i++) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          
          // Standard relative luminance
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          gray[i] = luma;
          totalBrightness += luma;
        }
        
        const brightness = totalBrightness / pixelsCount;
        
        // 2. Sharpness / Blur estimation using Laplacian variance
        // Let's compute a simple laplacian operator on the grayscale pixels.
        // Laplacian kernel:
        // [  0, -1,  0 ]
        // [ -1,  4, -1 ]
        // [  0, -1,  0 ]
        
        let sumLaplacian = 0;
        let sumSquaredLaplacian = 0;
        let countedEdges = 0;
        
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            
            // Apply Laplacian
            const val = 
              4 * gray[idx] - 
              gray[idx - 1] - 
              gray[idx + 1] - 
              gray[idx - w] - 
              gray[idx + w];
            
            sumLaplacian += val;
            sumSquaredLaplacian += val * val;
            countedEdges++;
          }
        }
        
        // Variance = E[X^2] - (E[X])^2
        const meanLaplacian = sumLaplacian / countedEdges;
        const variance = (sumSquaredLaplacian / countedEdges) - (meanLaplacian * meanLaplacian);
        
        // Thresholds calibrated for 250px max dimension:
        // Clear/sharp photos usually have variance > 80. Very blurry ones are < 35.
        const sharpness = Math.round(variance * 10) / 10;
        const isBlurry = sharpness < 35; 
        
        resolve({
          sharpness,
          isBlurry,
          brightness: Math.round(brightness)
        });
      } catch (err) {
        console.error('Image analysis failed:', err);
        // Fallback
        resolve({
          sharpness: 100,
          isBlurry: false,
          brightness: 128
        });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        sharpness: 100,
        isBlurry: false,
        brightness: 128
      });
    };
    
    img.src = url;
  });
}

// OpenStreetMap Nominatim Reverse Geocoding
export async function getReverseGeocoding(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {
        'Accept-Language': 'de,en'
      }
    });
    if (!res.ok) return '';
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.suburb || data.address.county || '';
      const country = data.address.country || '';
      const name = [city, country].filter(Boolean).join(', ');
      return name || data.display_name.split(',')[0] || '';
    }
    return '';
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return '';
  }
}
