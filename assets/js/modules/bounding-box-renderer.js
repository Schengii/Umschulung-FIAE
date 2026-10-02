/**
 * Draws labelled bounding boxes over an image (ElektroCheck AI scanner demo on
 * praktikumsbetrieb.html).
 *
 * Box coordinates are fractions (0–1) of the image. The overlay element is kept exactly on
 * top of the rendered image, so the boxes are placed in percent and stay correct when the
 * image is letterboxed inside its frame or the layout changes.
 */

/**
 * @typedef {object} BoundingBox
 * @property {number} x left edge, fraction of the image width
 * @property {number} y top edge, fraction of the image height
 * @property {number} width
 * @property {number} height
 * @property {string} [label]
 * @property {string} [color] CSS colour of border and label
 */

export class BoundingBoxRenderer {
    /**
     * @param {HTMLElement} image
     * @param {HTMLElement} overlay absolutely positioned sibling inside the image's frame
     */
    constructor(image, overlay) {
        this.image = image;
        this.overlay = overlay;
        this.syncOverlay = this.syncOverlay.bind(this);

        if ('ResizeObserver' in window) {
            new window.ResizeObserver(this.syncOverlay).observe(image);
        }
        window.addEventListener('resize', this.syncOverlay);
        image.addEventListener('load', this.syncOverlay);
    }

    /** Moves the overlay onto the area the image actually occupies. */
    syncOverlay() {
        const frame = this.overlay.parentElement;
        if (!frame) return;
        const frameRect = frame.getBoundingClientRect();
        const imageRect = this.image.getBoundingClientRect();
        this.overlay.style.left = `${imageRect.left - frameRect.left}px`;
        this.overlay.style.top = `${imageRect.top - frameRect.top}px`;
        this.overlay.style.width = `${imageRect.width}px`;
        this.overlay.style.height = `${imageRect.height}px`;
    }

    /** @param {BoundingBox[]} boxes */
    render(boxes) {
        this.syncOverlay();
        this.overlay.replaceChildren(
            ...boxes.map((box) => {
                const color = box.color || '#ef4444';
                const boxElement = document.createElement('div');
                boxElement.className = 'bounding-box';
                boxElement.style.border = `2px solid ${color}`;
                boxElement.style.left = `${box.x * 100}%`;
                boxElement.style.top = `${box.y * 100}%`;
                boxElement.style.width = `${box.width * 100}%`;
                boxElement.style.height = `${box.height * 100}%`;

                if (box.label) {
                    const label = document.createElement('span');
                    label.className = 'bounding-box-label';
                    label.textContent = box.label;
                    label.style.backgroundColor = color;
                    boxElement.appendChild(label);
                }
                return boxElement;
            })
        );
    }

    clear() {
        this.overlay.replaceChildren();
    }
}
