// Hide skeleton as soon as React has rendered content into #root.
// WICHTIG: Dieses Skript muss NACH <div id="root"> stehen - davor liefert
// getElementById('root') null, das Skript bricht ab und das Vollbild-Skeleton
// (position: fixed, z-index 9999) würde die App dauerhaft überdecken.
(function() {
  var sk = document.getElementById('app-skeleton');
  var root = document.getElementById('root');
  if (!sk || !root) return;
  var mo = new MutationObserver(function() {
    if (root.firstChild) {
      sk.classList.add('hidden');
      setTimeout(function() { sk.remove(); }, 350);
      mo.disconnect();
    }
  });
  mo.observe(root, { childList: true });
  // Fallback: remove after 8s regardless
  setTimeout(function() { if (sk.parentNode) sk.remove(); }, 8000);
})();
