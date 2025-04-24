import { Canvas } from "./canvas.js";

let selectedCell = null; // Static variable to store the currently selected cell
let selectedCanvas = null; // Track which canvas owns the selected cell
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
                selectedCanvas = this; // Track which canvas owns the selected cell
            });
        });

        if (!globalListenersAdded) {
            // Add document-level handler that doesn't bind to any specific canvas
            document.addEventListener("keydown", handleKeyDown);
            // Add event listener for clicks outside the canvas to deselect the current cell
            document.addEventListener("click", (event) => {
                if (selectedCell) {
                    selectedCell.classList.remove("selected");
                    selectedCell = null;
                    selectedCanvas = null;
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

// Document-level handler that uses the selectedCanvas reference
function handleKeyDown(event) {
    if (!selectedCell || !selectedCanvas) return;

    if (event.key && event.key.length === 1) {
        selectedCell.textContent = event.key;
        selectedCanvas.dispatchCanvasUpdatedEvent();
    } else if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
        selectedCanvas.moveSelection(event.key);
    } else if (event.key === "Backspace") {
        selectedCell.textContent = " ";
        selectedCanvas.dispatchCanvasUpdatedEvent();
    }
}
