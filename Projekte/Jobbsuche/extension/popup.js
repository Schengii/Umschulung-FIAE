document.getElementById('clipBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const getMeta = (prop) => {
                const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
                return el ? el.getAttribute('content') : '';
            };

            const title = getMeta('og:title') || document.querySelector('h1')?.innerText || document.title;
            const company = getMeta('og:site_name') || document.querySelector('[data-company-name], .company, .employer')?.innerText || window.location.hostname;
            const url = window.location.href;
            const description = getMeta('og:description') || document.querySelector('main, article, .job-description, #job-details')?.innerText?.slice(0, 1000) || '';

            const payload = encodeURIComponent(JSON.stringify({
                title: (title || '').trim(),
                company: (company || '').trim(),
                url: url,
                description: (description || '').trim(),
                location: 'Importiert via Extension'
            }));

            // Open JobMatch with clip payload
            window.open(`http://localhost:5173/?clip_job=${payload}`, '_blank');
        }
    });
});
