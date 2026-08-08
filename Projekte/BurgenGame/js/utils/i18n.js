// i18n.js - Simple internationalization loader
// Usage: const i18n = new I18n(); i18n.init();
class I18n {
  constructor(defaultLang = 'de') {
    this.lang = defaultLang;
    this.translations = {};
    this.supported = ['de', 'en'];
  }

  async load(lang) {
    if (!this.supported.includes(lang)) return;
    try {
      const resp = await fetch(`assets/lang/${lang}.json`);
      this.translations = await resp.json();
    } catch (e) {
      console.warn("Failed to fetch translations, using fallback dictionary:", e);
      this.translations = this.getFallbackTranslations(lang);
    }
    this.lang = lang;
  }

  getFallbackTranslations(lang) {
    const fallbacks = {
      de: {
        "title": "Empire Classic - Herrschaftskastenbauer",
        "description": "Baue deine Burg, rekrutiere Ritter und erobere räuberische Burgen in diesem mittelalterlichen Strategiespiel!",
        "loading": "Lade Königreich...",
        "toggle_theme": "Design wechseln",
        "tutorial_start": "Tutorial starten",
        "sound_on": "Ton an",
        "sound_off": "Ton aus"
      },
      en: {
        "title": "Empire Classic - Casual Castle Builder",
        "description": "Build your castle, recruit knights and conquer rogue castles in this medieval strategy game!",
        "loading": "Loading Kingdom...",
        "toggle_theme": "Toggle Theme",
        "tutorial_start": "Start Tutorial",
        "sound_on": "Sound On",
        "sound_off": "Sound Off"
      }
    };
    return fallbacks[lang] || fallbacks['de'];
  }

  async init() {
    // try to load from localStorage
    const saved = localStorage.getItem('empire_i18n_lang');
    const lang = saved || navigator.language.slice(0, 2) || this.lang;
    await this.load(lang);
    this.apply();
  }

  apply() {
    // Replace all elements with data-i18n-key attribute
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      const txt = this.translations[key] || key;
      if (el.tagName.toLowerCase() === 'input') {
        el.placeholder = txt;
      } else {
        el.textContent = txt;
      }
    });
  }

  setLang(lang) {
    localStorage.setItem('empire_i18n_lang', lang);
    this.load(lang).then(() => this.apply());
  }
}

// Export singleton
window.i18n = new I18n();
