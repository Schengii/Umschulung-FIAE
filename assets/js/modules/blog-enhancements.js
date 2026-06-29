/**
 * Reading Time & Social Share Module — Blog enhancements for news.html
 * - Automatically calculates reading time per article
 * - Adds social sharing buttons (LinkedIn, X/Twitter)
 */
function initBlogEnhancements() {
    initReadingTime();
    initSocialShare();
}

function initReadingTime() {
    const articles = document.querySelectorAll('article.card');
    if (!articles.length) return;

    const wordsPerMinute = 200;

    articles.forEach(article => {
        // Clear any existing badge to prevent duplicates
        const existingBadge = article.querySelector('.reading-time-badge');
        if (existingBadge) existingBadge.remove();

        const text = article.innerText || '';
        const wordCount = text.trim().split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

        const badge = document.createElement('span');
        badge.className = 'reading-time-badge';
        badge.innerHTML = `
            <i class="fa fa-clock-o" aria-hidden="true"></i>
            <span lang="de">${readTime} Min. Lesezeit</span>
            <span lang="en">${readTime} min read</span>
        `;

        // Insert after the h5 date element
        const dateEl = article.querySelector('h5');
        if (dateEl) {
            dateEl.after(badge);
        }
    });
}

function initSocialShare() {
    const articles = document.querySelectorAll('article.card');
    if (!articles.length) return;

    const pageUrl = encodeURIComponent(window.location.href);

    articles.forEach(article => {
        // Clear any existing share buttons to prevent duplicates
        const existingShare = article.querySelector('.social-share-buttons');
        if (existingShare) existingShare.remove();

        const title = article.querySelector('h2');
        if (!title) return;

        const titleText = encodeURIComponent(title.innerText.trim());

        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-buttons';
        shareContainer.innerHTML = `
            <span class="share-label">
                <span lang="de"><i class="fa fa-share-alt" aria-hidden="true"></i> Teilen:</span>
                <span lang="en"><i class="fa fa-share-alt" aria-hidden="true"></i> Share:</span>
            </span>
            <a href="https://linkedin.com/in/maximilian-schenk" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a>
            <a href="https://github.com/Schengii" target="_blank" rel="noopener" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a>
            <button class="share-btn share-copy" aria-label="Copy Link" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.innerHTML='<i class=\\'fa fa-check\\'></i>';setTimeout(()=>this.innerHTML='<i class=\\'fa fa-link\\'></i>',2000)})">
                <i class="fa fa-link" aria-hidden="true"></i>
            </button>
        `;

        article.appendChild(shareContainer);
    });
}

