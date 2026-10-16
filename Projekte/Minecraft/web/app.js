/* ==============================================================================
   Minecraft C++ Voxel Engine - Interactive Web Showcase & Documentation App
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initVoxelCanvas();
  initBlockRegistry();
  initCopyCode();
});

// --- 1. Interactive 3D Voxel Canvas & Day/Night Lighting Lab ---
function initVoxelCanvas() {
  const canvas = document.getElementById('voxel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const timeSlider = document.getElementById('time-slider');
  const hudTime = document.getElementById('hud-time');
  const blockSelector = document.getElementById('block-selector');
  const toggleAO = document.getElementById('toggle-ao');
  const toggleShadows = document.getElementById('toggle-shadows');
  const toggleFog = document.getElementById('toggle-fog');
  const timePresetBtns = document.querySelectorAll('.btn-chip');

  let currentHour = 12.0;
  let rotationAngle = 0;
  let currentBlockType = 'grass';

  // Palette definitions for blocks
  const blockColors = {
    grass: {
      top: '#5b8731',
      side: '#866043',
      sideTopGrass: '#5b8731',
      bottom: '#866043',
      icon: '🌱'
    },
    diamond_ore: {
      top: '#757575',
      side: '#757575',
      bottom: '#757575',
      accent: '#2be4d5',
      icon: '💎'
    },
    gold_ore: {
      top: '#757575',
      side: '#757575',
      bottom: '#757575',
      accent: '#fcee4b',
      icon: '🪙'
    },
    tnt: {
      top: '#bc3928',
      side: '#bc3928',
      bottom: '#bc3928',
      accent: '#ffffff',
      icon: '🧨'
    },
    obsidian: {
      top: '#19132b',
      side: '#19132b',
      bottom: '#19132b',
      accent: '#3e275f',
      icon: '🔮'
    },
    crafting_table: {
      top: '#ab7a46',
      side: '#7c532d',
      bottom: '#ab7a46',
      icon: '🔨'
    }
  };

  // Preset buttons
  timePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timePresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseFloat(btn.dataset.time);
      timeSlider.value = val;
      updateTime(val);
    });
  });

  timeSlider.addEventListener('input', (e) => {
    updateTime(parseFloat(e.target.value));
  });

  blockSelector.addEventListener('change', (e) => {
    currentBlockType = e.target.value;
  });

  function updateTime(hour) {
    currentHour = hour;
    let label = 'Day';
    if (hour >= 5 && hour < 8) label = 'Sunrise';
    else if (hour >= 8 && hour < 17) label = 'Day';
    else if (hour >= 17 && hour < 20) label = 'Sunset';
    else label = 'Night';

    const hInt = Math.floor(hour);
    const mInt = Math.floor((hour % 1) * 60);
    const timeStr = `${String(hInt).padStart(2, '0')}:${String(mInt).padStart(2, '0')}`;
    hudTime.textContent = `Time: ${timeStr} (${label})`;
  }

  // Calculate sky & sun color from hour
  function getAtmosphere(hour) {
    // 0 = night, 6 = dawn, 12 = noon, 18 = dusk, 24 = night
    let skyR, skyG, skyB, sunFactor;
    if (hour >= 6 && hour <= 18) {
      // Daytime
      const middayDist = Math.abs(hour - 12) / 6; // 0 at noon, 1 at 6 and 18
      skyR = Math.round(112 * (1 - middayDist) + 215 * middayDist);
      skyG = Math.round(168 * (1 - middayDist) + 115 * middayDist);
      skyB = Math.round(245 * (1 - middayDist) + 85 * middayDist);
      sunFactor = Math.max(0.2, 1.0 - middayDist * 0.4);
    } else {
      // Nighttime
      skyR = 12;
      skyG = 16;
      skyB = 28;
      sunFactor = 0.25;
    }
    return {
      skyColor: `rgb(${skyR}, ${skyG}, ${skyB})`,
      sunIntensity: sunFactor
    };
  }

  // Render loop
  function render() {
    rotationAngle += 0.012;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const atmosphere = getAtmosphere(currentHour);

    // Sky Background gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, atmosphere.skyColor);
    skyGrad.addColorStop(1, '#0b0f14');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic Fog Effect
    if (toggleFog && toggleFog.checked) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, height * 0.4, width, height * 0.6);
    }

    // Draw Sun or Moon
    const sunAngle = ((currentHour - 6) / 12) * Math.PI;
    const sunX = width / 2 + Math.cos(sunAngle) * (width * 0.38);
    const sunY = height * 0.45 - Math.sin(sunAngle) * (height * 0.35);

    if (currentHour >= 5 && currentHour <= 19) {
      // Sun with warm glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 65);
      sunGlow.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
      sunGlow.addColorStop(0.3, 'rgba(255, 210, 80, 0.4)');
      sunGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Sharp sun disc
      ctx.fillStyle = '#fffbe0';
      ctx.fillRect(sunX - 12, sunY - 12, 24, 24);
    } else {
      // Moon disc
      const moonX = width / 2 - Math.cos(sunAngle) * (width * 0.38);
      const moonY = height * 0.45 + Math.sin(sunAngle) * (height * 0.35);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(moonX - 10, moonY - 10, 20, 20);
    }

    // 3D Isometric Voxel Cube in Center
    drawIsometricVoxel(
      ctx,
      width / 2,
      height / 2 + 30,
      110,
      rotationAngle,
      currentBlockType,
      atmosphere.sunIntensity,
      toggleAO && toggleAO.checked,
      toggleShadows && toggleShadows.checked
    );

    requestAnimationFrame(render);
  }

  // Draw 3D Voxel with simulated lighting
  function drawIsometricVoxel(ctx, cx, cy, size, angle, blockType, sunIntensity, useAO, useShadow) {
    const pal = blockColors[blockType] || blockColors.grass;

    // Ground shadow
    if (useShadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.65, size * 0.9, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Rotated isometric projections
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const sX = size * 0.85;
    const sY = size * 0.48;
    const sH = size * 0.75;

    // Top Face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - sH);
    ctx.lineTo(cx + sX * cosA - sX * sinA * 0.5, cy - sH + sY * 0.5);
    ctx.lineTo(cx, cy - sH + sY);
    ctx.lineTo(cx - sX * cosA + sX * sinA * 0.5, cy - sH + sY * 0.5);
    ctx.closePath();

    let topBrightness = Math.min(1.0, sunIntensity * 1.15);
    ctx.fillStyle = shadeColor(pal.top, topBrightness);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top face detail for ores / tnt
    if (pal.accent) {
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(cx, cy - sH + sY * 0.5, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Left Face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - sX * cosA + sX * sinA * 0.5, cy - sH + sY * 0.5);
    ctx.lineTo(cx, cy - sH + sY);
    ctx.lineTo(cx, cy + sY * 0.4);
    ctx.lineTo(cx - sX * cosA + sX * sinA * 0.5, cy - sH + sY * 0.5 + sH);
    ctx.closePath();

    let leftBrightness = Math.min(1.0, sunIntensity * 0.85);
    if (useAO) leftBrightness *= 0.85;
    ctx.fillStyle = shadeColor(pal.side, leftBrightness);
    ctx.fill();
    ctx.stroke();

    // Side grass overlay
    if (blockType === 'grass') {
      ctx.fillStyle = shadeColor(pal.sideTopGrass, leftBrightness);
      ctx.beginPath();
      ctx.moveTo(cx - sX * cosA + sX * sinA * 0.5, cy - sH + sY * 0.5);
      ctx.lineTo(cx, cy - sH + sY);
      ctx.lineTo(cx, cy - sH + sY + 16);
      ctx.lineTo(cx - sX * cosA + sX * sinA * 0.5, cy - sH + sY * 0.5 + 16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Right Face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx + sX * cosA - sX * sinA * 0.5, cy - sH + sY * 0.5);
    ctx.lineTo(cx, cy - sH + sY);
    ctx.lineTo(cx, cy + sY * 0.4);
    ctx.lineTo(cx + sX * cosA - sX * sinA * 0.5, cy - sH + sY * 0.5 + sH);
    ctx.closePath();

    let rightBrightness = Math.min(1.0, sunIntensity * 0.65);
    if (useAO) rightBrightness *= 0.75;
    ctx.fillStyle = shadeColor(pal.side, rightBrightness);
    ctx.fill();
    ctx.stroke();

    if (blockType === 'grass') {
      ctx.fillStyle = shadeColor(pal.sideTopGrass, rightBrightness);
      ctx.beginPath();
      ctx.moveTo(cx + sX * cosA - sX * sinA * 0.5, cy - sH + sY * 0.5);
      ctx.lineTo(cx, cy - sH + sY);
      ctx.lineTo(cx, cy - sH + sY + 16);
      ctx.lineTo(cx + sX * cosA - sX * sinA * 0.5, cy - sH + sY * 0.5 + 16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function shadeColor(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));

    return `rgb(${r}, ${g}, ${b})`;
  }

  requestAnimationFrame(render);
}

// --- 2. Interactive Block Registry ---
function initBlockRegistry() {
  const container = document.getElementById('blocks-container');
  const searchInput = document.getElementById('block-search');
  const pills = document.querySelectorAll('.category-pills .pill');
  if (!container) return;

  const blocks = [
    { name: 'Diamond Ore', category: 'ores', icon: '💎', hardness: '3.0s', tool: 'Iron+ Pickaxe', light: '0', drops: 'Diamond' },
    { name: 'Gold Ore', category: 'ores', icon: '🪙', hardness: '3.0s', tool: 'Iron+ Pickaxe', light: '0', drops: 'Gold Ore' },
    { name: 'Iron Ore', category: 'ores', icon: '⚙️', hardness: '3.0s', tool: 'Stone+ Pickaxe', light: '0', drops: 'Iron Ore' },
    { name: 'Redstone Ore', category: 'ores', icon: '🔴', hardness: '3.0s', tool: 'Iron+ Pickaxe', light: '9 (lit)', drops: 'Redstone Dust (4-5)' },
    { name: 'Ancient Debris', category: 'ores', icon: '🪨', hardness: '30.0s', tool: 'Diamond+ Pickaxe', light: '0', drops: 'Ancient Debris' },
    { name: 'Grass Block', category: 'nature', icon: '🌱', hardness: '0.6s', tool: 'Shovel', light: '0', drops: 'Dirt' },
    { name: 'Dark Oak Wood', category: 'nature', icon: '🪵', hardness: '2.0s', tool: 'Axe', light: '0', drops: 'Dark Oak Log' },
    { name: 'Obsidian', category: 'nature', icon: '🔮', hardness: '50.0s', tool: 'Diamond Pickaxe', light: '0', drops: 'Obsidian' },
    { name: 'Sea Lantern', category: 'nature', icon: '🏮', hardness: '0.3s', tool: 'Any / Silk Touch', light: '15 (Max)', drops: 'Prismarine Crystals' },
    { name: 'Redstone Comparator', category: 'technical', icon: '📐', hardness: '0.2s', tool: 'Pickaxe', light: '0', drops: 'Comparator' },
    { name: 'Hopper', category: 'technical', icon: '📥', hardness: '3.0s', tool: 'Pickaxe', light: '0', drops: 'Hopper (5-slot)' },
    { name: 'TNT Explosive', category: 'technical', icon: '🧨', hardness: '0.0s', tool: 'Instant / Flint & Steel', light: '0', drops: 'Primed TNT Entity' },
  ];

  let currentCategory = 'all';
  let searchQuery = '';

  function renderBlocks() {
    container.innerHTML = '';
    const filtered = blocks.filter(b => {
      const matchCat = currentCategory === 'all' || b.category === currentCategory;
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.tool.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 2rem;">No blocks match your search.</div>';
      return;
    }

    filtered.forEach(b => {
      const card = document.createElement('div');
      card.className = 'block-item';
      card.innerHTML = `
        <div class="block-header">
          <div class="block-preview-box">${b.icon}</div>
          <div class="block-name">${b.name}</div>
        </div>
        <div class="block-meta">
          <div>Hardness: <span style="color:#f3f4f6;">${b.hardness}</span></div>
          <div>Harvest Tool: <span style="color:#38bdf8;">${b.tool}</span></div>
          <div>Emission: <span style="color:#f59e0b;">Level ${b.light}</span></div>
          <div>Drop: <span style="color:#34d399;">${b.drops}</span></div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(btn => btn.classList.remove('active'));
      p.classList.add('active');
      currentCategory = p.dataset.category;
      renderBlocks();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderBlocks();
  });

  renderBlocks();
}

// --- 3. Copy Code Snippet ---
function initCopyCode() {
  const btn = document.getElementById('btn-copy-code');
  const codePre = document.getElementById('code-snippet');
  if (!btn || !codePre) return;

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(codePre.innerText).then(() => {
      const orig = btn.innerText;
      btn.innerText = 'Copied! ✓';
      btn.style.color = '#34d399';
      setTimeout(() => {
        btn.innerText = orig;
        btn.style.color = '';
      }, 2000);
    });
  });
}
