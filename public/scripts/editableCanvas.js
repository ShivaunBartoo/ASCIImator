import { Canvas } from "./canvas.js";

let selectedCell = null; // Static variable to store the currently selected cell
let globalListenersAdded = false; // Flag to track if global event listeners have been added

/**
 * Represents an editable canvas element that allows for interactive cell selection and content manipulation.
 * Extends the Canvas class to add interaction events.
 */
export class EditableCanvas extends Canvas {
    constructor(element, width, height, scale) {
        super(element, width, height, scale);
        this.addInteractionEvents();
    }

    initCanvas() {
        super.initCanvas();
        this.addInteractionEvents();
    }

    /**
     * Adds interaction events to the canvas
     */
    addInteractionEvents() {
        this.element.querySelectorAll(".canvas-cell").forEach((cell) => {
            cell.addEventListener("click", (event) => {
                // Prevent the click event from bubbling up to the document
                event.stopPropagation();
                this.selectCell(cell);
            });
        });

        if (!globalListenersAdded) {
            // Add event listener for keydown events
            document.addEventListener("keydown", this.handleKeyDown.bind(this));
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
     * Selects a canvas cell and updates the selectedCell variable
     * @param {Element} cell - The cell element to select
     */
    selectCell(cell) {
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
    handleKeyDown(event) {
        if (event.key.length === 1) {
            if (selectedCell) {
                selectedCell.textContent = event.key;
                this.dispatchCanvasUpdatedEvent();
            }
        }
        if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
        ) {
            this.moveSelection(event.key);
        }
        if (event.key === "Backspace") {
            selectedCell.textContent = " ";
            this.dispatchCanvasUpdatedEvent();
        }
    }

    /**
     * Moves the selection to an adjacent cell based on the direction
     * @param {string} direction - The direction to move the selection ("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")
     */
    moveSelection(direction) {
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
                this.selectCell(newCell);
            }
        }
    }
}
