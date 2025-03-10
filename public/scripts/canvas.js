const cellWidthMult = 1.75;
const cellHeightMult = 1.25;

/**
 * Represents a canvas element that allows for interactive cell selection and content manipulation.
 * Provides methods to convert the canvas content to string or JSON, load content from JSON,
 * and handle user interactions such as cell selection and keyboard input.
 */
export class Canvas {
    constructor(element, width, height, scale = 1) {
        this.element = element;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.initCanvas();
    }

    /**
     * Converts the canvas content to a string
     * @returns {string} String representation of the canvas content
     */
    toString() {
        let output = "";
        this.element.querySelectorAll(".canvas-cell").forEach((cell) => {
            output += cell.textContent;
        });
        return output;
    }

    /**
     * Converts the canvas content to a JSON object
     * @returns {Object} JSON representation of the canvas content
     */
    toJSON() {
        let output = {
            width: this.width,
            height: this.height,
            cells: [],
        };
        this.element.querySelectorAll(".canvas-cell").forEach((cell) => {
            output.cells.push(cell.textContent);
        });
        return output;
    }

    /**
     * Loads the canvas content from a JSON object
     * @param {Object} json - JSON object representing the canvas content
     */
    fromJSON(json) {
        if (!this.JSONisValid(json)) {
            throw new Error("Invalid JSON format");
        }
        this.width = json.width;
        this.height = json.height;
        this.initCanvas();
        let cells = this.element.querySelectorAll(".canvas-cell");
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = json.cells[i];
        }
        this.dispatchCanvasUpdatedEvent();
    }

    /**
     * Validates the structure of a JSON object for the canvas
     * @param {Object} json - JSON object to validate
     * @returns {boolean} True if the JSON object is valid, false otherwise
     */
    JSONisValid(json) {
        if (typeof json !== "object" || json === null) {
            return false;
        }
        if (typeof json.width !== "number" || json.width <= 0) {
            return false;
        }
        if (typeof json.height !== "number" || json.height <= 0) {
            return false;
        }
        if (!Array.isArray(json.cells) || json.cells.length !== json.width * json.height) {
            return false;
        }
        return true;
    }

    /**
     * Initializes the canvas by creating the HTML structure and injecting CSS styles
     */
    initCanvas() {
        this.element.innerHTML = this.getCanvasHTML();
        this.styleCanvasSize();
    }

    /**
     * Generates the HTML structure for the canvas
     * @returns {string} HTML string representing the canvas structure
     */
    getCanvasHTML() {
        let html = `<table class='canvas'>`;
        for (let i = 0; i < this.height; i++) {
            html += "<tr>";
            for (let j = 0; j < this.width; j++) {
                html += `<td class="canvas-cell" data-x="${j}" data-y="${i}" style="width: ${cellWidthMult}ch; height: ${cellHeightMult}em;"> </td>`;
            }
            html += "</tr>";
        }
        html += "</table>";
        return html;
    }


    /**
     * Adjusts the size and scale of the canvas element based on the provided scale, width, and height.
    */
    styleCanvasSize() {
        this.element.style.transform = `scale(${this.scale})`;
        this.element.style.width = `${this.width * cellWidthMult}ch`;
        this.element.style.height = `${this.height * cellHeightMult}em`;
    }

    /**
     * Sets the content of a specific cell at the given coordinates
     * @param {number} x - X coordinate of the cell
     * @param {number} y - Y coordinate of the cell
     * @param {string} char - Character to set in the cell
     * @returns {boolean} True if the cell was found and set, false otherwise
     */
    setCell(x, y, char) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        const cell = this.element.querySelector(`.canvas-cell[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            cell.textContent = char;
            this.dispatchCanvasUpdatedEvent();
            return true;
        }
        return false;
    }

    /**
     * Dispatches a custom event when the canvas is updated
     */
    dispatchCanvasUpdatedEvent() {
        const event = new CustomEvent("CanvasUpdated", {
            detail: {
                canvas: this,
            },
            bubbles: true,
            composed: true,
        });
        this.element.dispatchEvent(event);
    }
}
