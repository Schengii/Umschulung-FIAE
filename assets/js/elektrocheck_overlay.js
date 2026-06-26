/**
 * Visual Bounding Box Overlay for ElektroCheck AI
 * Renders bounding boxes on an image based on AI detection results.
 */

class BoundingBoxRenderer {
    constructor(imageElementId, overlayContainerId) {
        this.imageElement = document.getElementById(imageElementId);
        this.overlayContainer = document.getElementById(overlayContainerId);
        this.currentBoundingBoxes = null; // To store boxes for re-rendering on resize

        if (!this.imageElement) {
            console.error(`Image element with ID '${imageElementId}' not found.`);
            return;
        }
        if (!this.overlayContainer) {
            console.error(`Overlay container with ID '${overlayContainerId}' not found.`);
            return;
        }

        // Ensure the overlay container is positioned relative to the image
        // The image itself should be inside a relatively positioned parent
        // or the overlayContainer is absolutely positioned within a relative parent.
        // A better approach would be to wrap both in a dedicated relative container.
        this.imageElement.onload = () => this.adjustOverlaySize();
        window.addEventListener('resize', () => this.adjustOverlaySize());
    }

    /**
     * Adjusts the size and position of the overlay container to match the image.
     * This is crucial for responsive images.
     */
    adjustOverlaySize() {
        if (!this.imageElement || !this.overlayContainer) return;

        const imgRect = this.imageElement.getBoundingClientRect();
        this.overlayContainer.style.width = `${imgRect.width}px`;
        this.overlayContainer.style.height = `${imgRect.height}px`;
        // Assuming the overlay container is a sibling of the image within a relatively positioned parent
        // If the overlay is a direct child of the image's parent, its top/left should be 0.
        // If it's a sibling, it needs to be positioned relative to the parent.
        // For simplicity, let's assume the overlayContainer's parent is the same as imageElement's parent
        // and the parent is positioned relatively.
        // The overlayContainer itself should be absolutely positioned.
        // The following lines might need adjustment based on actual HTML structure.
        // For a simple case where overlayContainer is a sibling and parent is relative:
        // this.overlayContainer.style.left = `${this.imageElement.offsetLeft}px`;
        // this.overlayContainer.style.top = `${this.imageElement.offsetTop}px`;

        // Re-render existing boxes if any, to adjust their positions
        if (this.currentBoundingBoxes) {
            this.renderBoundingBoxes(this.currentBoundingBoxes);
        }
    }

    /**
     * Renders bounding boxes on the image.
     * @param {Array<Object>} boundingBoxes - An array of bounding box objects.
     *   Each object should have:
     *   - x: relative x-coordinate (0 to 1, from left)
     *   - y: relative y-coordinate (0 to 1, from top)
     *   - width: relative width (0 to 1)
     *   - height: relative height (0 to 1)
     *   - label: (optional) text label for the box
     *   - color: (optional) CSS color for the box border
     */
    renderBoundingBoxes(boundingBoxes) {
        if (!this.imageElement || !this.overlayContainer) return;

        // Clear previous bounding boxes
        this.overlayContainer.innerHTML = '';
        this.currentBoundingBoxes = boundingBoxes; // Store for re-rendering on resize

        if (!boundingBoxes || boundingBoxes.length === 0) {
            return;
        }

        const imgWidth = this.imageElement.clientWidth;
        const imgHeight = this.imageElement.clientHeight;

        boundingBoxes.forEach((box, index) => {
            const boxEl = document.createElement('div');
            boxEl.className = 'bounding-box';
            boxEl.style.position = 'absolute';
            boxEl.style.border = `2px solid ${box.color || 'red'}`;
            boxEl.style.left = `${box.x * imgWidth}px`;
            boxEl.style.top = `${box.y * imgHeight}px`;
            boxEl.style.width = `${box.width * imgWidth}px`;
            boxEl.style.height = `${box.height * imgHeight}px`;
            boxEl.style.pointerEvents = 'auto'; // Allow interaction with the box
            boxEl.style.boxSizing = 'border-box'; // Ensure border is included in width/height
            boxEl.style.cursor = 'pointer';
            boxEl.title = box.label || `Defekt ${index + 1}`;

            // Optional: Add a label
            if (box.label) {
                const labelEl = document.createElement('span');
                labelEl.className = 'bounding-box-label';
                labelEl.textContent = box.label;
                labelEl.style.backgroundColor = box.color || 'red';
                labelEl.style.color = 'white';
                labelEl.style.padding = '2px 5px';
                labelEl.style.fontSize = '0.7em';
                labelEl.style.position = 'absolute';
                labelEl.style.top = '-1.5em'; // Position above the box, adjust as needed
                labelEl.style.left = '0';
                labelEl.style.whiteSpace = 'nowrap';
                labelEl.style.borderRadius = '3px';
                boxEl.appendChild(labelEl);
            }

            // Optional: Add click event for more details
            boxEl.addEventListener('click', () => {
                console.log('Bounding box clicked:', box.label || `Box ${index + 1}`, box);
                // Here you could trigger a modal or display more info
                alert(`Defekt: ${box.label || 'Unbekannt'}\nPosition: (${(box.x * 100).toFixed(1)}%, ${(box.y * 100).toFixed(1)}%)\nGröße: ${(box.width * 100).toFixed(1)}% x ${(box.height * 100).toFixed(1)}%`);
            });

            this.overlayContainer.appendChild(boxEl);
        });
    }

    /**
     * Clears all bounding boxes from the overlay.
     */
    clearBoundingBoxes() {
        if (this.overlayContainer) {
            this.overlayContainer.innerHTML = '';
            this.currentBoundingBoxes = null;
        }
    }
}

// To use this, in your ElektroCheck AI page's main script (e.g., elektrocheck.js):
// 1. Ensure your HTML has an <img> with id="uploaded-image" and a <div> with id="bounding-box-overlay"
//    The <img> and the overlay <div> should be wrapped in a relatively positioned container.
//    Example HTML:
//    <div style="position: relative; display: inline-block;">
//        <img id="uploaded-image" src="path/to/your/image.jpg" alt="Uploaded device image" style="max-width: 100%; height: auto; display: block;">
//        <div id="bounding-box-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
//    </div>
//
// 2. Instantiate the renderer:
//    const bboxRenderer = new BoundingBoxRenderer('uploaded-image', 'bounding-box-overlay');
//
// 3. When you receive AI response with bounding box data:
//    const aiResponse = {
//        // ... other AI data
//        boundingBoxes: [
//            { x: 0.1, y: 0.1, width: 0.2, height: 0.15, label: "Beschädigtes Kabel", color: "red" },
//            { x: 0.5, y: 0.3, width: 0.3, height: 0.2, label: "Korrodierte Kontakte", color: "orange" }
//        ]
//    };
//
//    if (aiResponse.boundingBoxes) {
//        bboxRenderer.renderBoundingBoxes(aiResponse.boundingBoxes);
//    }
//
// 4. To clear boxes:
//    bboxRenderer.clearBoundingBoxes();