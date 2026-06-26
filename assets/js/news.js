document.addEventListener('DOMContentLoaded', () => {
    const newsArticlesContainer = document.getElementById('news-articles-container');
    const filterButtons = document.querySelectorAll('.btn-filter');
    let currentLanguage = localStorage.getItem('language') || 'de'; // Get current language from localStorage

    function renderNews(filter = 'all') {
        newsArticlesContainer.innerHTML = ''; // Clear existing articles

        // newsData is assumed to be globally available from news_data.js
        newsData.forEach(article => {
            if (filter === 'all' || article.category === filter) {
                const articleElement = document.createElement('article');
                articleElement.classList.add('card', `filter-${article.category}`);

                const title = currentLanguage === 'de' ? article.title_de : article.title_en;
                const date = currentLanguage === 'de' ? article.date_de : article.date_en;
                const content = currentLanguage === 'de' ? article.content_de : article.content_en;

                let contentHtml = '';
                content.forEach(paragraph => {
                    contentHtml += `<p>${paragraph}</p>`;
                });

                articleElement.innerHTML = `
                    <h2>${title}</h2>
                    <h5><span lang="${currentLanguage}">${date}</span></h5>
                    ${contentHtml}
                `;
                newsArticlesContainer.appendChild(articleElement);
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderNews(this.dataset.filter);
        });
    });

    // Initial render and listen for language changes
    renderNews();
    window.addEventListener('languageChanged', (event) => {
        currentLanguage = event.detail.language;
        const activeFilter = document.querySelector('.btn-filter.active').dataset.filter;
        renderNews(activeFilter);
    });
});