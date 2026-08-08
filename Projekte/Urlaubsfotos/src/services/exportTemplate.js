// Builds self-contained standalone HTML package for sharing highlight galleries

export async function generateSharingHtml(title, photos) {
  const photoCardsHtml = [];
  
  for (const p of photos) {
    const compressedBlob = await compressImageForExport(p.blob);
    const base64 = await blobToBase64(compressedBlob);
    photoCardsHtml.push(`
      <div class="photo-card" onclick="openLightbox('${base64}', '${p.name.replace(/'/g, "\\'")}', '${(p.location?.name || '').replace(/'/g, "\\'")}', '${new Date(p.date).toLocaleDateString('de-DE')}')">
        <img src="${base64}" alt="${p.name}" />
        <div class="photo-overlay">
          <div class="photo-info">
            <strong>${p.location?.name || p.name}</strong>
            <p>${new Date(p.date).toLocaleDateString('de-DE')}</p>
          </div>
        </div>
      </div>
    `);
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Geteilte UrlaubsMomente</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    body {
      background: radial-gradient(circle at 50% 0%, #151824 0%, #0a0b10 100%);
      color: #f1f3f9;
      font-family: 'Outfit', -apple-system, sans-serif;
      margin: 0;
      padding: 4rem 2rem;
      min-height: 100vh;
      box-sizing: border-box;
    }
    
    header {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin: 0 0 0.5rem;
      background: linear-gradient(135deg, #ffffff 40%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p.subtitle {
      color: #9ca3af;
      font-size: 1.1rem;
      margin: 0;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .photo-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 4/3;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
    }
    
    .photo-card:hover {
      transform: scale(1.03) translateY(-6px);
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.3);
    }
    
    .photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s;
    }
    
    .photo-card:hover img {
      transform: scale(1.04);
    }
    
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10, 12, 22, 0.95), rgba(10, 12, 22, 0.3) 40%, transparent);
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .photo-card:hover .photo-overlay {
      opacity: 1;
    }
    
    .photo-info strong {
      font-size: 1.1rem;
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .photo-info p {
      margin: 0;
      font-size: 0.9rem;
      color: #9ca3af;
    }
    
    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(6, 8, 14, 0.98);
      backdrop-filter: blur(20px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .lightbox img {
      max-width: 90vw;
      max-height: 75vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    
    .lightbox-info {
      margin-top: 1.5rem;
      text-align: center;
      font-family: 'Outfit', sans-serif;
    }
    
    .lightbox-info h3 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem;
    }
    
    .lightbox-info p {
      margin: 0;
      color: #9ca3af;
    }
    
    .close-btn {
      position: absolute;
      top: 2rem;
      right: 2rem;
      background: transparent;
      border: none;
      color: white;
      font-size: 3rem;
      cursor: pointer;
      line-height: 1;
      transition: transform 0.2s;
    }
    
    .close-btn:hover {
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p class="subtitle">Geteilte Highlights aus UrlaubsMomente</p>
  </header>
  <div class="grid">
    ${photoCardsHtml.join('')}
  </div>

  <div id="lightbox" class="lightbox" onclick="closeLightbox()">
    <button class="close-btn" onclick="closeLightbox()">&times;</button>
    <img id="lightbox-img" src="" alt="" onclick="event.stopPropagation()"/>
    <div class="lightbox-info" onclick="event.stopPropagation()">
      <h3 id="lightbox-title"></h3>
      <p id="lightbox-date"></p>
    </div>
  </div>

  <script>
    function openLightbox(src, name, location, date) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox-title').innerText = location || name;
      document.getElementById('lightbox-date').innerText = date;
      document.getElementById('lightbox').style.display = 'flex';
    }
    
    function closeLightbox() {
      document.getElementById('lightbox').style.display = 'none';
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  </script>
</body>
</html>`;
}

// Convert binary Blob to Base64 URI string
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

function compressImageForExport(blob, maxDim = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
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
      canvas.toBlob((newBlob) => {
        resolve(newBlob || blob);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.src = url;
  });
}

