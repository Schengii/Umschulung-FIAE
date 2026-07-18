/**
 * Timeline Scroll Progress Module
 * Dynamically draws scroll-linked progress lines for CV timelines and
 * animates markers when milestone cards enter the viewport.
 */

export function initTimelineScroll() {
    const timelines = document.querySelectorAll('.timeline-v2');
    if (!timelines.length) return;

    timelines.forEach(timeline => {
        // Ensure parent has position relative/static for absolute centering
        timeline.style.position = 'relative';

        // Create SVG container
        const svgContainer = document.createElement('div');
        svgContainer.className = 'timeline-svg-container';
        svgContainer.style.position = 'absolute';
        svgContainer.style.left = '7px'; // Matches center of the markers
        svgContainer.style.top = '10px';
        svgContainer.style.bottom = '10px';
        svgContainer.style.width = '3px';
        svgContainer.style.pointerEvents = 'none';
        svgContainer.style.zIndex = '0';

        svgContainer.innerHTML = `
            <svg style="width: 100%; height: 100%; display: block; overflow: visible;">
                <line x1="1.5" y1="0" x2="1.5" y2="100%" stroke="var(--border)" stroke-width="3" stroke-linecap="round" />
                <line class="timeline-active-line" x1="1.5" y1="0" x2="1.5" y2="0" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" />
            </svg>
        `;
        timeline.appendChild(svgContainer);

        const items = timeline.querySelectorAll('.timeline-v2-item');
        const activeLine = svgContainer.querySelector('.timeline-active-line');

        function updateProgress() {
            const rect = timeline.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Trigger scroll point when milestone reaches 70% of screen height
            const triggerPoint = viewHeight * 0.7;

            const start = rect.top;
            const totalHeight = rect.height;

            let progressHeight = 0;
            if (start < triggerPoint) {
                const scrolledDistance = triggerPoint - start;
                progressHeight = Math.min(totalHeight, scrolledDistance);
            }

            // Update active path y2 SVG coordinate
            activeLine.setAttribute('y2', progressHeight.toString());

            // Activate markers dynamically
            items.forEach(item => {
                const marker = item.querySelector('.timeline-v2-marker');
                if (!marker) return;

                const markerRect = marker.getBoundingClientRect();
                if (markerRect.top < triggerPoint) {
                    marker.classList.add('active');
                } else {
                    marker.classList.remove('active');
                }
            });
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress, { passive: true });
        
        // Initial execution on boot
        setTimeout(updateProgress, 100);
    });
}
