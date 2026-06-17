/**
 * Scroll Animations Module — IntersectionObserver reveal
 */
function initScrollAnimations() {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    if (document.getElementById('mySubmit')) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
}
