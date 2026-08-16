// --- MOBILE GESTURES & HAPTIC FEEDBACK OVERLAY 2.0 ---
(function() {
  window.MobileHaptics = {
    vibrate(pattern) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(pattern);
        } catch(e) {}
      }
    },

    triggerHaptic(type) {
      switch(type) {
        case 'click':
          this.vibrate(15);
          break;
        case 'build':
          this.vibrate([30, 50, 30]);
          break;
        case 'hit':
          this.vibrate([50, 30, 80]);
          break;
        case 'victory':
          this.vibrate([100, 50, 100, 50, 200]);
          break;
        default:
          this.vibrate(20);
      }
    },

    init() {
      console.log('📱 MobileHaptics Module Initialized.');
      document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('clickable')) {
          this.triggerHaptic('click');
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.MobileHaptics.init();
  });
})();
