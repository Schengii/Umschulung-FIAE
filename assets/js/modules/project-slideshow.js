/**
 * Project Slideshow Module — Interactive IHK presentation slides viewer
 */
function initSlideshow() {
    const viewer = document.getElementById('slide-viewer');
    if (!viewer) return;

    const slides = viewer.querySelectorAll('.slide');
    const prevBtn = document.getElementById('slide-prev');
    const nextBtn = document.getElementById('slide-next');
    const indicator = document.getElementById('slide-indicator');

    if (!slides.length || !prevBtn || !nextBtn || !indicator) return;

    let currentSlide = 0;

    function showSlide(index) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');

        // Update indicator
        indicator.textContent = `${currentSlide + 1} / ${slides.length}`;

        // Disable buttons at boundaries
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === slides.length - 1;
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) showSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
    });

    // Keyboard support when hovering the slideshow
    viewer.addEventListener('mouseenter', () => {
        document.addEventListener('keydown', handleKeyNavigation);
    });

    viewer.addEventListener('mouseleave', () => {
        document.removeEventListener('keydown', handleKeyNavigation);
    });

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSlide > 0) showSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
        }
    }

    // Initial load
    showSlide(0);
}
