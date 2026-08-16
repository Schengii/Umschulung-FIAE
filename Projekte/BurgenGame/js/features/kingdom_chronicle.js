// --- KINGDOM CHRONICLE & PROCEDURAL LORE SYSTEM ---
(function() {
  window.KingdomChronicle = {
    events: [],

    init() {
      console.log('📜 KingdomChronicle Module Initialized.');
      this.loadChronicle();
    },

    logEvent(title, description, category = 'milestone') {
      const entry = {
        id: 'CR-' + Date.now(),
        date: new Date().toLocaleDateString('de-DE'),
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        title: title,
        description: description,
        category: category
      };
      this.events.unshift(entry);
      this.saveChronicle();

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`📜 Chronik-Eintrag: ${title}`, 'info');
      }
    },

    saveChronicle() {
      try {
        localStorage.setItem('BURGEN_KINGDOM_CHRONICLE', JSON.stringify(this.events.slice(0, 50)));
      } catch(e) {}
    },

    loadChronicle() {
      try {
        const raw = localStorage.getItem('BURGEN_KINGDOM_CHRONICLE');
        if (raw) this.events = JSON.parse(raw);
      } catch(e) {
        this.events = [];
      }
    },

    showChronicleModal() {
      this.loadChronicle();
      let listHtml = '';
      if (!this.events.length) {
        listHtml = '<p style="color:#aaa; text-align:center;">Noch keine Epen in der Chronik verzeichnet. Erbaue dein Reich!</p>';
      } else {
        this.events.forEach(e => {
          listHtml += `
            <div style="background: rgba(20,25,35,0.85); border-left: 3px solid #d4af37; border-radius: 4px; padding: 10px; margin-bottom: 8px;">
              <div style="font-size: 0.75em; color: #d4af37;">${e.date} um ${e.time} Uhr</div>
              <div style="font-weight: bold; color: #fff; font-size: 0.95em;">${e.title}</div>
              <div style="font-size: 0.85em; color: #ccc; margin-top: 4px;">${e.description}</div>
            </div>
          `;
        });
      }

      if (window.UI && window.UI.showModal) {
        window.UI.showModal({
          title: '📜 Chronik des Königreichs',
          content: `
            <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
              ${listHtml}
            </div>
          `
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.KingdomChronicle.init();
  });
})();
