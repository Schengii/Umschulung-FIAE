document.addEventListener('DOMContentLoaded', () => {
    const newsArticlesContainer = document.getElementById('news-articles-container');
    const filterButtons = document.querySelectorAll('.btn-filter');
    const searchInput = document.getElementById('news-searchbar');
    let currentLanguage = 'de';
    
    if (typeof StorageManager !== 'undefined' && typeof STORAGE_KEYS !== 'undefined') {
        currentLanguage = StorageManager.getItem(STORAGE_KEYS.LANG, 'de');
    } else {
        currentLanguage = document.documentElement.getAttribute('lang') || 'de';
    }

    // Inject highlight flash styles and share button style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flash-highlight {
            0% { box-shadow: 0 0 0 4px var(--primary); }
            100% { box-shadow: none; }
        }
        .highlight-flash {
            animation: flash-highlight 2.5s ease-out;
            border-color: var(--primary) !important;
        }
        .news-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }
        .news-card-header h2 {
            margin: 0;
            font-size: 1.4rem;
        }
        .copy-article-btn {
            background: var(--bg-page);
            border: 1px solid var(--border);
            color: var(--text-primary);
            cursor: pointer;
            border-radius: 20px;
            padding: 0.35rem 0.85rem;
            font-size: 0.8rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .copy-article-btn:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }
        .news-no-results {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-muted);
        }
    `;
    document.head.appendChild(style);

    function renderNews(filter = 'all') {
        if (!newsArticlesContainer) return;
        newsArticlesContainer.innerHTML = ''; // Clear existing articles

        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        let visibleCount = 0;

        // newsData is assumed to be globally available from news_data.js
        newsData.forEach(article => {
            const titleDe = (article.title_de || '').toLowerCase();
            const titleEn = (article.title_en || '').toLowerCase();
            const contentDe = (article.content_de || []).join(' ').toLowerCase();
            const contentEn = (article.content_en || []).join(' ').toLowerCase();

            const matchesFilter = filter === 'all' || article.category === filter;
            const matchesSearch = query === '' || 
                titleDe.includes(query) || 
                titleEn.includes(query) || 
                contentDe.includes(query) || 
                contentEn.includes(query);

            if (matchesFilter && matchesSearch) {
                visibleCount++;
                const articleElement = document.createElement('article');
                articleElement.classList.add('card', `filter-${article.category}`);
                articleElement.id = article.id;

                const title = currentLanguage === 'de' ? article.title_de : article.title_en;
                const date = currentLanguage === 'de' ? article.date_de : article.date_en;
                const content = currentLanguage === 'de' ? article.content_de : article.content_en;

                let contentHtml = '';
                content.forEach(paragraph => {
                    contentHtml += `<p>${paragraph}</p>`;
                });

                articleElement.innerHTML = `
                    <div class="news-card-header">
                        <h2>${title}</h2>
                        <button class="copy-article-btn" data-id="${article.id}" title="${currentLanguage === 'de' ? 'Link kopieren' : 'Copy link'}">
                            <i class="fa fa-share-alt" aria-hidden="true"></i>
                            <span lang="de">Teilen</span>
                            <span lang="en">Share</span>
                        </button>
                    </div>
                    <h5><span lang="${currentLanguage}">${date}</span></h5>
                    ${contentHtml}
                `;
                newsArticlesContainer.appendChild(articleElement);
            }
        });

        if (visibleCount === 0) {
            newsArticlesContainer.innerHTML = `
                <div class="news-no-results">
                    <i class="fa fa-search" aria-hidden="true" style="font-size:3rem; margin-bottom:1rem; color:var(--border);"></i>
                    <h3 lang="de">Keine Artikel gefunden</h3>
                    <h3 lang="en">No articles found</h3>
                    <p lang="de">Versuche es mit einem anderen Suchbegriff.</p>
                    <p lang="en">Try searching for a different term.</p>
                </div>
            `;
        }

        // Trigger blog enhancements (reading time, social share) on the rendered news cards
        if (typeof initBlogEnhancements === 'function') {
            initBlogEnhancements();
        }
    }

    // Filter Buttons binding
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderNews(this.dataset.filter);
        });
    });

    // Search bar binding
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activeFilterBtn = document.querySelector('.btn-filter.active');
            const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
            renderNews(activeFilter);
        });
    }

    // Dynamic searchbar placeholder translation
    function updateSearchPlaceholder() {
        if (!searchInput) return;
        if (currentLanguage === 'de') {
            searchInput.placeholder = 'News durchsuchen...';
            searchInput.setAttribute('aria-label', 'News durchsuchen');
        } else {
            searchInput.placeholder = 'Search news...';
            searchInput.setAttribute('aria-label', 'Search news');
        }
    }

    // Initial render and listen for language changes
    updateSearchPlaceholder();
    renderNews();
    
    // Copy article link handler
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-article-btn');
        if (!btn) return;

        const articleId = btn.getAttribute('data-id');
        const shareUrl = `${window.location.origin}${window.location.pathname}#${articleId}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            if (typeof window.showToast === 'function') {
                window.showToast(
                    currentLanguage === 'de' ? 'Artikel-Link in die Zwischenablage kopiert!' : 'Article link copied to clipboard!',
                    'success'
                );
            }

            // Dynamic commit grid tick (Punkte sammeln!)
            if (typeof window.addLiveCommit === 'function') {
                window.addLiveCommit();
            }
        });
    });

    document.addEventListener('langchange', (event) => {
        currentLanguage = event.detail;
        updateSearchPlaceholder();
        const activeFilterBtn = document.querySelector('.btn-filter.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
        renderNews(activeFilter);
    });

    // Scroll and flash linked article from hash
    const handleHash = () => {
        const hash = window.location.hash;
        if (hash) {
            const id = hash.substring(1);
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlight-flash');
                }
            }, 600);
        }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
});