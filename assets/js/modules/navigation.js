/**
 * Navigation Module — Mobile Menu, Accessible Dropdowns, Escape-Handling
 */
function initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = isOpen ? 'fa fa-times' : 'fa fa-bars';
        });
    }

    const dropdownItems = document.querySelectorAll('.nav-item');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown-menu');

        if (dropdown && link) {
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');

            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const isOpen = item.classList.toggle('open');
                    link.setAttribute('aria-expanded', isOpen);
                }
            });

            const subItems = dropdown.querySelectorAll('.dropdown-item');
            subItems.forEach(subItem => {
                const subLink = subItem.querySelector('.dropdown-link');
                const subDropdown = subItem.querySelector('.sub-dropdown-menu');

                if (subDropdown && subLink) {
                    subLink.setAttribute('aria-haspopup', 'true');
                    subLink.setAttribute('aria-expanded', 'false');

                    subLink.addEventListener('click', (e) => {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            const isSubOpen = subItem.classList.toggle('open');
                            subLink.setAttribute('aria-expanded', isSubOpen);
                        }
                    });
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fa fa-bars';
                    menuToggle.focus();
                }
            }
            dropdownItems.forEach(item => {
                if (item.classList.contains('open')) {
                    item.classList.remove('open');
                    const link = item.querySelector('.nav-link');
                    if (link) link.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}
