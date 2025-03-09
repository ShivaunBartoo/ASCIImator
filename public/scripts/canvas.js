let selectedCell = null; // Static variable to store the currently selected cell
let globalListenersAdded = false; // Flag to track if global event listeners have been added

export class Canvas {
    constructor(element, width, height) {
        this.element = element;
        this.width = width;
        this.height = height;
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
        this.width = json.width;
        this.height = json.height;
        this.initCanvas();
        let cells = this.element.querySelectorAll(".canvas-cell");
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = json.cells[i];
        }
    }

    /**
     * Initializes the canvas by creating the HTML structure and adding event listeners
     */
    initCanvas() {
        this.element.innerHTML = this.#getCanvasHTML();
        this.element.querySelectorAll(".canvas-cell").forEach((cell) => {
            cell.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click event from bubbling up to the document
                this.#selectCell(cell);
            });
        });

        if (!globalListenersAdded) {
            // Add event listener for keydown events
            document.addEventListener("keydown", this.#handleKeyDown.bind(this));
            // Add event listener for clicks outside the canvas to deselect the current cell
            document.addEventListener("click", (event) => {
                if (selectedCell) {
                    selectedCell.classList.remove("selected");
                    selectedCell = null;
                }
            });
            // Set the flag to true to indicate that global listeners have been added
            globalListenersAdded = true;
        }
    }

    /**
     * Generates the HTML structure for the canvas
     * @returns {string} HTML string representing the canvas structure
     */
    #getCanvasHTML() {
        let html = `<table class='canvas'>`;
        for (let i = 0; i < this.height; i++) {
            html += "<tr>";
            for (let j = 0; j < this.width; j++) {
                html += `<td class="canvas-cell" data-x="${j}" data-y="${i}"> </td>`;
            }
            html += "</tr>";
        }
        html += "</table>";
        return html;
    }

    /**
     * Selects a canvas cell and updates the selectedCell variable
     * @param {Element} cell - The cell element to select
     */
    #selectCell(cell) {
        if (selectedCell) {
            selectedCell.classList.remove("selected");
        }
        selectedCell = cell;
        selectedCell.classList.add("selected");
    }

    /**
     * Handles keydown events to update the content of the selected cell
     * @param {Event} event - The keydown event
     */
    #handleKeyDown(event) {
        if (event.key.length === 1) {
            if (selectedCell) {
                selectedCell.textContent = event.key;
            }
        }
        if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
        ) {
            this.#moveSelection(event.key);
        }
    }

    /**
     * Moves the selection to an adjacent cell based on the direction
     * @param {string} direction - The direction to move the selection ("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")
     */
    #moveSelection(direction) {
        if (!selectedCell) return;

        let x = parseInt(selectedCell.getAttribute("data-x"));
        let y = parseInt(selectedCell.getAttribute("data-y"));

        switch (direction) {
            case "ArrowUp":
                if (y > 0) y--;
                break;
            case "ArrowDown":
                if (y < selectedCell.parentElement.parentElement.children.length - 1) y++;
                break;
            case "ArrowLeft":
                if (x > 0) x--;
                break;
            case "ArrowRight":
                if (x < selectedCell.parentElement.children.length - 1) x++;
                break;
        }

        const newRow = selectedCell.parentElement.parentElement.children[y];
        if (newRow) {
            const newCell = newRow.children[x];
            if (newCell) {
                this.#selectCell(newCell);
            }
        }
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
            return true;
        }
        return false;
    }
}
