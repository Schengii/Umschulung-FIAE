/**
 * Search & Filter Module — Live card search and category filtering
 */
let currentSearchQuery = '';
let currentCategory = 'all';

export function initSearchAndFilter() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (!APP.SEARCHABLE_PAGES.includes(currentPage)) return;

    const searchBar = document.getElementById('searchbar');
    const filterButtons = document.querySelectorAll('.btn-filter');

    let noResultsContainer = document.querySelector('.no-results');
    if (!noResultsContainer) {
        const main = document.querySelector('main');
        if (main) {
            noResultsContainer = document.createElement('div');
            noResultsContainer.className = 'no-results';
            noResultsContainer.innerHTML = `
                <i class="fa fa-search" aria-hidden="true"></i>
                <h2 lang="de">Keine Ergebnisse gefunden</h2>
                <h2 lang="en">No results found</h2>
                <p lang="de">Versuche es mit einem anderen Suchbegriff oder Filter.</p>
                <p lang="en">Try another search term or filter.</p>
            `;
            main.appendChild(noResultsContainer);
        }
    }

    if (searchBar) {
        searchBar.addEventListener('input', () => {
            currentSearchQuery = searchBar.value.toLowerCase().trim();
            applyFilters();
        });
    }

    if (filterButtons) {
        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                filterButtons.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');
                currentCategory = button.getAttribute('data-filter') || 'all';
                applyFilters();
            });
        });
    }
}

/**
 * Pure evaluation function for card filtering.
 * Determines whether a card matches the given category and search query.
 */
export function matchesCardFilter(categoryClassList, textContent, activeCategory = 'all', searchQuery = '') {
    let matchesCategory = true;
    if (activeCategory !== 'all') {
        const targetClass = `filter-${activeCategory}`;
        matchesCategory = Array.isArray(categoryClassList)
            ? categoryClassList.includes(targetClass)
            : categoryClassList && typeof categoryClassList.contains === 'function'
              ? categoryClassList.contains(targetClass)
              : false;
    }

    let matchesSearch = true;
    const normalizedQuery = (searchQuery || '').toLowerCase().trim();
    if (normalizedQuery !== '') {
        matchesSearch = (textContent || '').toLowerCase().includes(normalizedQuery);
    }

    return matchesCategory && matchesSearch;
}

function applyFilters() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    if (!APP.SEARCHABLE_PAGES.includes(currentPage)) return;

    const cards = document.querySelectorAll('.card, .card2');
    const isWelcomePage = !!document.getElementById('mySubmit');
    let visibleCount = 0;

    cards.forEach((card) => {
        if (isWelcomePage) return;

        const shouldShow = matchesCardFilter(card.classList, card.textContent, currentCategory, currentSearchQuery);
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });

    const noResultsContainer = document.querySelector('.no-results');
    if (noResultsContainer) {
        const queryActive = currentSearchQuery !== '' || currentCategory !== 'all';
        noResultsContainer.style.display = visibleCount === 0 && queryActive ? 'block' : 'none';
    }
}
