import { Canvas } from "/scripts/canvas.js";
const canvases = new Array();
const initialCanvasCount = 3;
const canvasWidth = 12;
const canvasHeight = 8;

addCanvas(initialCanvasCount);

/**
 * Fetches canvas template and adds specified number of canvases to the container
 * @param {number} count - Number of canvases to add
 * @returns {Promise<Canvas[]>} Promise that resolves with the newly added Canvas instances
 */
function addCanvas(count) {
    return fetch("/html/canvas.html")
        .then((response) => response.text())
        .then((html) => {
            let container = document.querySelector("#canvases");
            let template = document.createElement("template");
            template.innerHTML = html;

            let newCanvases = [];
            for (let i = 0; i < count; i++) {
                let canvasContainer = template.content.firstElementChild.cloneNode(true);
                container.appendChild(canvasContainer);

                let canvasElement = canvasContainer.querySelector(".canvas");
                let newCanvas = new Canvas(canvasElement, canvasWidth, canvasHeight);
                canvases.push(newCanvas);
                newCanvases.push(newCanvas);
                getElementCanvas(canvasElement).setCell(0, 0, canvases.length);
            }
            updateNavigationButtons();
            return newCanvases;
        });
}

/**
 * Removes a canvas instance from both the array and DOM
 * If it's the last canvas, clears it instead of removing
 * @param {Canvas} canvas - Canvas instance to delete
 */
function deleteCanvas(canvas) {
    if (canvases.length == 1) {
        // If this is the last canvas, clear it instead of removing
        canvas.initCanvas();
    } else {
        // Remove canvas from both the array and DOM
        let index = canvases.findIndex((c) => c === canvas);
        if (index !== -1) {
            canvases.splice(index, 1);
        }
        canvas.element.closest(".canvas-container").remove();
        updateNavigationButtons();
    }
}

/**
 * Swaps content between two adjacent canvases
 * @param {Canvas} canvas - Source canvas to move
 * @param {number} direction - Direction to move (-1 for left, 1 for right)
 */
function moveCanvas(canvas, direction) {
    let index = getCanvasIndex(canvas);
    let neighborIndex = index + direction;
    if (neighborIndex >= 0 && neighborIndex < canvases.length) {
        let neighborCanvas = canvases[neighborIndex];
        let JSONbuffer = neighborCanvas.toJSON();
        neighborCanvas.fromJSON(canvas.toJSON());
        canvas.fromJSON(JSONbuffer);
    }
}

/**
 * Finds Canvas instance associated with a DOM element
 * @param {Element} element - DOM element to find Canvas for
 * @returns {Canvas|undefined} Canvas instance if found
 */
function getElementCanvas(element) {
    return canvases.find((canvas) => canvas.element === element);
}

/**
 * Gets Canvas instance from a click event's target element
 * @param {Event} event - Click event
 * @returns {Canvas|undefined} Canvas instance if found
 */
function getEventCanvas(event) {
    return getElementCanvas(event.target.closest(".canvas-container").querySelector(".canvas"));
}

/**
 * Finds the index of a Canvas instance in the canvases array
 * @param {Canvas} canvas - Canvas instance to find
 * @returns {number} Index of the canvas in the canvases array
 */
function getCanvasIndex(canvas) {
    return canvases.findIndex((c) => c === canvas);
}

// Global click handler for all canvas-related buttons
document.addEventListener("click", (event) => {
    if (event.target.closest(".add-button")) {
        handleAddButtonClick();
    } else if (event.target.closest(".delete-button")) {
        handleDeleteButtonClick(event);
    } else if (event.target.closest(".copy-button")) {
        handleCopyButtonClick(event);
    } else if (event.target.closest(".left-button")) {
        handleMoveButtonClick(event, -1);
    } else if (event.target.closest(".right-button")) {
        handleMoveButtonClick(event, 1);
    }
});

/**
 * Handles click on add button - creates a new canvas
 */
function handleAddButtonClick() {
    addCanvas(1);
}

/**
 * Handles click on delete button - removes canvas if found
 * @param {Event} event - Click event
 */
function handleDeleteButtonClick(event) {
    let canvas = getEventCanvas(event);
    if (canvas) {
        deleteCanvas(canvas);
    } else {
        console.error("Canvas instance not found for element");
    }
}

/**
 * Handles click on copy button - duplicates canvas content
 * @param {Event} event - Click event
 */
function handleCopyButtonClick(event) {
    let canvas = getEventCanvas(event);
    let index = getCanvasIndex(canvas);
    let canvasData = canvas.toJSON();

    addCanvas(1).then(([newCanvas]) => {
        newCanvas.fromJSON(canvasData);

        for (let i = canvases.length - 1; i > index + 1; i--) {
            moveCanvas(canvases[i], -1);
        }
    });
}

/**
 * Handles click on move buttons - moves canvas left or right
 * @param {Event} event - Click event
 * @param {number} direction - Direction to move (-1 for left, 1 for right)
 */
function handleMoveButtonClick(event, direction) {
    let canvas = getEventCanvas(event);
    if (canvas) {
        moveCanvas(canvas, direction);
    } else {
        console.error("Canvas instance not found for element");
    }
}

/**
 * Updates navigation button states based on canvas position
 * Disables left button for first canvas and right button for last canvas
 */
function updateNavigationButtons() {
    document.querySelectorAll(".canvas-container").forEach((container, index) => {
        const leftButton = container.querySelector(".left-button");
        const rightButton = container.querySelector(".right-button");

        if (index === 0) {
            leftButton.classList.add("disabled");
        } else {
            leftButton.classList.remove("disabled");
        }

        if (index === canvases.length - 1) {
            rightButton.classList.add("disabled");
        } else {
            rightButton.classList.remove("disabled");
        }
    });
}
