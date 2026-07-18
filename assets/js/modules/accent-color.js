/**
 * Accent Color Customizer Module
 * Manages accent selection, dropdown display, and persistence.
 */

export function initAccentColor() {
    const accentToggle = document.getElementById('accent-toggle');
    const accentDropdown = document.getElementById('accent-dropdown');

    if (!accentToggle || !accentDropdown) return;

    // Toggle dropdown
    accentToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = accentDropdown.style.display === 'flex';
        accentDropdown.style.display = isOpen ? 'none' : 'flex';
    });

    // Close dropdown on clicking outside
    document.addEventListener('click', () => {
        accentDropdown.style.display = 'none';
    });

    // Handle clicks inside dropdown (prevent bubble-up so dropdown stays open if needed, though color click will close it)
    accentDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Accent selection dots
    const dots = accentDropdown.querySelectorAll('.accent-dot-btn');
    
    // Highlight the active dot on load
    const currentAccent = document.documentElement.getAttribute('data-accent') || 'blue';
    updateActiveDot(currentAccent);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const val = dot.getAttribute('data-accent-val');
            if (val) {
                // Update HTML attribute
                document.documentElement.setAttribute('data-accent', val);
                
                // Save preference
                try {
                    localStorage.setItem('portfolio_accent', val);
                } catch (e) {
                    console.warn('LocalStorage not accessible for saving accent.');
                }
                
                // Highlight active dot
                updateActiveDot(val);
                
                // Close dropdown
                accentDropdown.style.display = 'none';
            }
        });
    });

    function updateActiveDot(activeVal) {
        dots.forEach(dot => {
            if (dot.getAttribute('data-accent-val') === activeVal) {
                dot.classList.add('active');
                dot.setAttribute('aria-checked', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-checked', 'false');
            }
        });
    }
}
