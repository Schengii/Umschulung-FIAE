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

    const lang = document.documentElement.getAttribute('lang') || 'de';
    const wordsPerMinute = 200;

    articles.forEach(article => {
        const text = article.textContent || '';
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
        const title = article.querySelector('h2');
        if (!title) return;

        const titleText = encodeURIComponent(title.textContent.trim());

        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-buttons';
        shareContainer.innerHTML = `
            <span class="share-label">
                <span lang="de"><i class="fa fa-share-alt" aria-hidden="true"></i> Teilen:</span>
                <span lang="en"><i class="fa fa-share-alt" aria-hidden="true"></i> Share:</span>
            </span>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}" target="_blank" rel="noopener" class="share-btn share-linkedin" aria-label="Share on LinkedIn">
                <i class="fa fa-linkedin" aria-hidden="true"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${titleText}&url=${pageUrl}" target="_blank" rel="noopener" class="share-btn share-twitter" aria-label="Share on X/Twitter">
                <i class="fa fa-twitter" aria-hidden="true"></i>
            </a>
            <button class="share-btn share-copy" aria-label="Copy Link" onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.innerHTML='<i class=\\'fa fa-check\\'></i>';setTimeout(()=>this.innerHTML='<i class=\\'fa fa-link\\'></i>',2000)})">
                <i class="fa fa-link" aria-hidden="true"></i>
            </button>
        `;

        article.appendChild(shareContainer);
    });
}
