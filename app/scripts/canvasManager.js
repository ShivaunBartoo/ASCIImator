import { EditableCanvas } from "./editableCanvas.js";

/**
 * Manages multiple EditableCanvas instances and their interactions
 */
export class CanvasManager {
    constructor(containerSelector, canvasWidth, canvasHeight) {
        this.container = document.querySelector(containerSelector);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvases = [];
    }

    /**
     * Initializes the CanvasManager with a specified number of canvases
     * @param {number} count - Number of canvases to create
     * @returns {Promise<EditableCanvas[]>} Promise that resolves with the new Canvas instances
     */
    async initialize(count) {
        return await this.addCanvas(count);
    }

    /**
     * Adds new canvases to the container
     * @param {number} count - Number of canvases to add
     * @returns {Promise<EditableCanvas[]>} Promise that resolves with the new Canvas instances
     */
    async addCanvas(count) {
        // Fetch the HTML template for the editable canvas
        return fetch("../html/editableCanvas.html")
            .then((response) => response.text())
            .then((html) => {
                // Create a template element to hold the fetched HTML
                let template = document.createElement("template");
                template.innerHTML = html;

                let newCanvases = [];
                // Loop to create the specified number of canvases
                for (let i = 0; i < count; i++) {
                    // Clone the template content and append it to the container
                    let canvasContainer = template.content.firstElementChild.cloneNode(true);
                    this.container.appendChild(canvasContainer);

                    let canvasElement = canvasContainer.querySelector(".canvas");
                    let newCanvas = new EditableCanvas(canvasElement, this.canvasWidth, this.canvasHeight, 1);
                    this.canvases.push(newCanvas);
                    newCanvases.push(newCanvas);
                    newCanvas.dispatchCanvasUpdatedEvent();
                }
                this.updateNavigationButtons();
                return newCanvases;
            });
    }

    /**
     * Deletes a number of canvases or clears it if it's the last one
     * @param {EditableCanvas} canvas - Canvas instance to delete
     * @param {number} [count=1] - Number of canvases to delete
     */
    deleteCanvas(canvas, count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.canvases.length == 1) {
                // If this is the last canvas, clear it instead
                canvas.initCanvas();
            } else {
                // Delete the canvas
                let index = this.getCanvasIndex(canvas);
                if (index !== -1) {
                    this.canvases.splice(index, 1);
                }
                canvas.element.closest(".canvas-container").remove();
                canvas.dispatchCanvasUpdatedEvent();
                this.updateNavigationButtons();
            }
        }
    }

    /**
     * Swaps the content of two adjacent canvases
     * @param {EditableCanvas} canvas - Source canvas to move
     * @param {number} direction - Direction to move (-1 for left, 1 for right)
     */
    swapCanvas(canvas, direction) {
        let index = this.getCanvasIndex(canvas);
        let neighborIndex = index + direction;
        if (neighborIndex >= 0 && neighborIndex < this.canvases.length) {
            let neighborCanvas = this.canvases[neighborIndex];
            let JSONbuffer = neighborCanvas.toJSON();
            neighborCanvas.fromJSON(canvas.toJSON());
            canvas.fromJSON(JSONbuffer);
            canvas.dispatchCanvasUpdatedEvent();
            neighborCanvas.dispatchCanvasUpdatedEvent();
        }
    }

    /**
     * Retrieves the animation frames from the canvases.
     *
     * @returns {Array<Object>} An array of JSON representations of the canvases.
     */
    getFrames() {
        return this.canvases.map((canvas) => canvas.toJSON());
    }

    /**
     * Finds Canvas instance associated with a DOM element
     * @param {Element} element - DOM element to find Canvas for
     * @returns {EditableCanvas|undefined} Canvas instance if found
     */
    getElementCanvas(element) {
        return this.canvases.find((canvas) => canvas.element === element);
    }

    /**
     * Gets Canvas instance from a click event's target element
     * @param {Event} event - Click event
     * @returns {EditableCanvas|undefined} Canvas instance if found
     */
    getEventCanvas(event) {
        return this.getElementCanvas(event.target.closest(".canvas-container").querySelector(".canvas"));
    }

    /**
     * Finds the index of a Canvas instance in the canvases array
     * @param {EditableCanvas} canvas - Canvas instance to find
     * @returns {number} Index of the canvas (-1 if not found)
     */
    getCanvasIndex(canvas) {
        return this.canvases.findIndex((c) => c === canvas);
    }

    /**
     * Updates the enabled/disabled state of navigation buttons
     * Disables left button for first canvas and right button for last canvas
     */
    updateNavigationButtons() {
        this.container.querySelectorAll(".canvas-container").forEach((container, index) => {
            const leftButton = container.querySelector(".left-button");
            const rightButton = container.querySelector(".right-button");

            if (index === 0) {
                leftButton.classList.add("disabled");
            } else {
                leftButton.classList.remove("disabled");
            }

            if (index === this.canvases.length - 1) {
                rightButton.classList.add("disabled");
            } else {
                rightButton.classList.remove("disabled");
            }
        });
    }
}
