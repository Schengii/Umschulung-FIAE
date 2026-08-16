// --- ECONOMY INTERACTIVE CANVAS CHARTS FEATURE ---
(function() {
  window.EconomyCharts = {
    history: {
      wood: [],
      stone: [],
      iron: [],
      gold: [],
      food: []
    },
    maxPoints: 30,

    init() {
      console.log('📈 EconomyCharts Module Initialized.');
    },

    recordTick(resources) {
      if (!resources) return;
      ['wood', 'stone', 'iron', 'gold', 'food'].forEach(res => {
        if (!this.history[res]) this.history[res] = [];
        this.history[res].push(resources[res] || 0);
        if (this.history[res].length > this.maxPoints) {
          this.history[res].shift();
        }
      });
    },

    renderChartCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width = canvas.parentElement.clientWidth || 400;
      const height = canvas.height = 200;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 20; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const colors = {
        wood: '#8B5A2B',
        stone: '#A9A9A9',
        iron: '#708090',
        gold: '#D4AF37',
        food: '#2E8B57'
      };

      const keys = Object.keys(this.history);
      let maxVal = 100;

      keys.forEach(k => {
        const arr = this.history[k];
        if (arr.length) {
          const localMax = Math.max(...arr);
          if (localMax > maxVal) maxVal = localMax;
        }
      });

      keys.forEach(k => {
        const data = this.history[k];
        if (!data || data.length < 2) return;

        ctx.strokeStyle = colors[k] || '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (this.maxPoints - 1);
        data.forEach((val, index) => {
          const x = index * stepX;
          const y = height - (val / maxVal) * (height - 30) - 15;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.stroke();
      });

      // Legend
      let legendX = 10;
      keys.forEach(k => {
        ctx.fillStyle = colors[k];
        ctx.fillRect(legendX, 10, 10, 10);
        ctx.fillStyle = '#ccc';
        ctx.font = '11px sans-serif';
        ctx.fillText(k.toUpperCase(), legendX + 14, 18);
        legendX += 70;
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.EconomyCharts.init();
  });
})();
