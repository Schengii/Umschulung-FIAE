// Dynamically loads TensorFlow.js and MobileNet to classify images client-side

let modelPromise = null;
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

async function loadTFModel() {
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      // 1. Load TensorFlow core library
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
      // 2. Load MobileNet classifier
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');
      
      if (!window.mobilenet) {
        throw new Error('MobileNet library failed to load globally.');
      }
      
      const model = await window.mobilenet.load({
        version: 1,
        alpha: 1.0
      });
      return model;
    } catch (err) {
      console.error('Error initializing TensorFlow / MobileNet:', err);
      modelPromise = null;
      throw err;
    }
  })();

  return modelPromise;
}

// Classify image using loaded MobileNet model
export async function classifyImage(file) {
  return new Promise(async (resolve) => {
    try {
      const model = await loadTFModel();
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = async () => {
        URL.revokeObjectURL(url);
        
        // Render to canvas to resize and feed into TF
        const canvas = getSharedCanvas();
        const ctx = canvas.getContext('2d');
        canvas.width = 224; // MobileNet input size
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, 224, 224);
        
        try {
          const predictions = await model.classify(canvas);
          // Get top 3 tags, clean them (e.g. split synonyms)
          const tags = predictions.slice(0, 3).map(p => {
            const label = p.className.split(',')[0].trim();
            return translateTag(label);
          });
          resolve(tags);
        } catch (err) {
          console.error('Classification error:', err);
          resolve([]);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([]);
      };

      img.src = url;
    } catch (err) {
      console.error('AI tagging initialization failed:', err);
      resolve([]);
    }
  });
}

// Simple English-to-German mapping for popular holiday categories
const TRANSLATION_MAP = {
  'seashore': 'Strand',
  'sandbar': 'Sandstrand',
  'cliff': 'Klippe',
  'valley': 'Tal',
  'mountain': 'Berge',
  'alp': 'Alpen',
  'lakeside': 'See',
  'volcano': 'Vulkan',
  'fountain': 'Brunnen',
  'monument': 'Denkmal',
  'church': 'Kirche',
  'castle': 'Schloss',
  'palace': 'Palast',
  'street': 'Straße',
  'cab': 'Taxi',
  'beach wagon': 'Strandmobil',
  'plate': 'Teller/Essen',
  'dining table': 'Esstisch',
  'pizza': 'Pizza',
  'ice cream': 'Eiscreme',
  'suit': 'Anzug',
  'sunglasses': 'Sonnenbrille',
  'swimming trunks': 'Badehose',
  'bikini': 'Bikini',
  'coral reef': 'Korallenriff',
  'forest': 'Wald',
  'tree': 'Baum',
  'bridge': 'Brücke',
  'promontory': 'Kap / Landzunge',
  'boat': 'Boot',
  'ship': 'Schiff',
  'aircraft': 'Flugzeug'
};

function translateTag(tag) {
  const lowerTag = tag.toLowerCase();
  for (const [en, de] of Object.entries(TRANSLATION_MAP)) {
    if (lowerTag.includes(en)) {
      return de;
    }
  }
  // Capitalize original English tag if no translation is matched
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}
