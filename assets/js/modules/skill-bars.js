/**
 * Skill Bars Module — Animated skill bar fill via IntersectionObserver
 * Supports interactive filtering when clicked.
 */
function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    if (!skillFills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(fill => observer.observe(fill));

    // Handle interactive skill filtering for portfolio
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
        // Only make clickable on pages where project search/filtering exists
        if (document.getElementById('portfolio-searchbar')) {
            bar.style.cursor = 'pointer';
            bar.title = 'Klicken, um Projekte nach dieser Technologie zu filtern / Click to filter projects';
            
            // Add a small hover scale effect using JavaScript or CSS injection
            bar.addEventListener('mouseenter', () => {
                bar.style.transform = 'translateX(4px)';
                bar.style.transition = 'transform 0.2s ease';
            });
            bar.addEventListener('mouseleave', () => {
                bar.style.transform = 'none';
            });

            bar.addEventListener('click', () => {
                const nameEl = bar.querySelector('.skill-name');
                if (!nameEl) return;
                
                const skillName = nameEl.textContent.trim();
                let filterTerm = skillName;
                
                // Map display names to standard tags/search terms
                if (skillName.includes('HTML')) filterTerm = 'HTML';
                else if (skillName.includes('JavaScript')) filterTerm = 'JavaScript';
                else if (skillName.includes('Java')) filterTerm = 'Java';
                else if (skillName.includes('SQL')) filterTerm = 'SQL';
                else if (skillName.includes('Git')) filterTerm = 'Git';

                // Dispatch the event that portfolio.js listens to
                document.dispatchEvent(new CustomEvent('radarfilter', { detail: filterTerm }));
            });
        }
    });
}
