const BACKEND_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  const pageTitleEl = document.getElementById('page-title');
  const pageUrlEl = document.getElementById('page-url');
  const importBtn = document.getElementById('import-btn');
  const statusEl = document.getElementById('status');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    pageTitleEl.textContent = tab.title || 'Aktuelle Seite';
    pageUrlEl.textContent = tab.url ? tab.url.substring(0, 45) + '...' : '';
  }

  importBtn.addEventListener('click', async () => {
    if (!tab || !tab.url) return;

    importBtn.disabled = true;
    statusEl.className = '';
    statusEl.textContent = 'Analysiere und übergleiche...';

    try {
      // Execute script in tab to get innerText
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText
      });

      const bodyText = result?.result || '';

      const res = await fetch(`${BACKEND_URL}/api/listings/import-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: tab.url,
          rawText: bodyText
        })
      });

      if (res.ok) {
        const data = await res.json();
        statusEl.className = 'success';
        statusEl.textContent = `✅ Inserat importiert! Score: ${data.listing?.matchScore || 50}%`;
      } else {
        const err = await res.json();
        statusEl.className = 'error';
        statusEl.textContent = `❌ ${err.error || 'Fehler beim Import'}`;
      }
    } catch (err) {
      statusEl.className = 'error';
      statusEl.textContent = `❌ Verbindungsfehler zu ${BACKEND_URL}`;
    } finally {
      importBtn.disabled = false;
    }
  });
});
