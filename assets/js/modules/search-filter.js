/**
 * Search & Filter Module — Live card search and category filtering
 */
let currentSearchQuery = '';
let currentCategory = 'all';

function initSearchAndFilter() {
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
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCategory = button.getAttribute('data-filter') || 'all';
                applyFilters();
            });
        });
    }
}

function applyFilters() {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    
    if (!APP.SEARCHABLE_PAGES.includes(currentPage)) return;

    const cards = document.querySelectorAll('.card, .card2');
    const isWelcomePage = !!document.getElementById('mySubmit');
    let visibleCount = 0;
    
    cards.forEach(card => {
        if (isWelcomePage) return;
        
        let matchesCategory = true;
        if (currentCategory !== 'all') {
            matchesCategory = card.classList.contains(`filter-${currentCategory}`);
        }
        
        let matchesSearch = true;
        if (currentSearchQuery !== '') {
            matchesSearch = card.textContent.toLowerCase().includes(currentSearchQuery);
        }
        
        const shouldShow = matchesCategory && matchesSearch;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    const noResultsContainer = document.querySelector('.no-results');
    if (noResultsContainer) {
        const queryActive = currentSearchQuery !== '' || currentCategory !== 'all';
        noResultsContainer.style.display = (visibleCount === 0 && queryActive) ? 'block' : 'none';
    }
}
