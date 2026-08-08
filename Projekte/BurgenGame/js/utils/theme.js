// theme.js – handles dark/light mode toggle
class ThemeManager {
  static STORAGE_KEY = 'empire_theme';

  static init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'dark';
    this.apply(saved);
  }

  static toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  static apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// expose globally for UI button
window.ThemeManager = ThemeManager;
