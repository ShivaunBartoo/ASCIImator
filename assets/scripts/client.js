import { CanvasManager } from "./canvasManager.js";
import { AnimCanvas } from "./animCanvas.js";

const canvasManager = new CanvasManager("#canvases", 12, 8);
const animCanvasElement = document.querySelector("#anim-canvas");
const tooSmallCanvasElement = document.querySelector("#too-small-canvas");
const tooSmallCanvas = new AnimCanvas(tooSmallCanvasElement, 12, 8, 1, [{}], 6);
const tooSmallAnimation = `assets/json/sleepy_cat.json`;
const animCanvas = new AnimCanvas(animCanvasElement, 12, 8, 2, [{}], 6);
let unsavedChanges = false;

initializeApp();

/**
 * Initializes the application.
 * @returns {Promise<void>}
 */
async function initializeApp() {
    setupCanvasUpdates();
    setupFPSControls();
    setupClickHandlers();
    setupConfirmationDialogue();
    await initializeCanvases();
    loadPendingAnimation();
    tooSmallCanvas.fromFile(tooSmallAnimation);
    unsavedChanges = false;
}

/**
 * Loads any pending animation from localStorage and removes it after loading.
 * Used to pass animation data from the gallery page to the main page.
 * @returns {Promise<void>}
 */
async function loadPendingAnimation() {
    const pendingAnimation = localStorage.getItem("pendingAnimation");
    if (pendingAnimation) {
        try {
            const animData = JSON.parse(pendingAnimation);
            await loadAnimation(animData);
            unsavedChanges = false;
            localStorage.removeItem("pendingAnimation");
        } catch (error) {
            console.error("Error loading pending animation:", error);
        }
    }
}

/**
 * Sets up the event listener for CanvasUpdated events.
 * Keeps the animCanvas in sync with the EditableCanvases managed by the canvasManager.
 * @returns {void}
 */
function setupCanvasUpdates() {
    document.addEventListener("CanvasUpdated", (event) => {
        if (event.detail.canvas !== animCanvas && event.detail.canvas !== tooSmallCanvas) {
            try {
                const frames = canvasManager.getFrames();
                animCanvas.setFrames(frames);
                unsavedChanges = true;
            } catch (err) {
                console.error("Error updating frames:", err);
            }
        }
    });
}

/**
 * Sets up the FPS input controls.
 * @returns {void}
 */
function setupFPSControls() {
    const fpsInput = document.getElementById("fps");
    const fpsValue = document.getElementById("fps-value");

    fpsValue.textContent = fpsInput.value;

    fpsInput.addEventListener("input", function () {
        fpsValue.textContent = fpsInput.value;
        animCanvas.setFPS(fpsInput.value);
    });
}

/**
 * Sets up click handlers for UI buttons.
 * @returns {void}
 */
function setupClickHandlers() {
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
        } else if (event.target.closest("#open-gallery")) {
            handleOpenGallery();
        } else if (event.target.closest("#save-to-disk")) {
            handleSaveToDisk();
        } else if (event.target.closest("#load-from-disk")) {
            handleLoadFromDisk(event);
        } else if (event.target.closest("#clear-animation")) {
            handleClearAnimation();
        } else if (event.target.closest("#save-gif")) {
            handleSaveGif();
        }
    });
}

/**
 * Sets up the confirmation dialogue for confirming user actions.
 * Handles confirm/cancel button clicks and keyboard shortcuts (Enter/Escape).
 * @returns {void}
 */
function setupConfirmationDialogue() {
    let dialogue = document.querySelector("#confirmation-dialogue");
    if (dialogue) {
        let confirm = () => {
            dialogue.style.visibility = "";
            if (typeof dialogue._action === "function") {
                dialogue._action();
                dialogue._action = null;
            }
        };
        if (dialogue) {
            dialogue.addEventListener("click", (event) => {
                if (event.target.closest("#cancel")) {
                    dialogue.style.visibility = "";
                }
                if (event.target.closest("#confirm")) {
                    confirm();
                }
            });
            dialogue.addEventListener("keydown", (event) => {
                console.log(event.key);
                if (event.key === "Escape") {
                    dialogue.style.visibility = "";
                }
                if (event.key === "Enter") {
                    confirm();
                }
            });
        }
    } else {
        console.error("Confirmation dialogue element not found in the DOM.");
    }
}

/**
 * Initializes the main canvases for the animation editor and starts playback.
 * @returns {Promise<void>}
 */
async function initializeCanvases() {
    await canvasManager.initialize(3);
    animCanvas.play();
}

/**
 * Handles navigation to the gallery page, prompting the user if there are unsaved changes.
 * @returns {Promise<void>}
 */
async function handleOpenGallery() {
    if (unsavedChanges) {
        const message = `Are you sure you want to leave this page? 
        All usaved changes will be lost.`;
        confirmAction(message, () => (window.location.href = `assets/html/gallery.html`));
    } else {
        window.location.href = `assets/html/gallery.html`;
    }
}

/**
 * Handles click on add button - creates a new canvas.
 * @returns {void}
 */
function handleAddButtonClick() {
    canvasManager.addCanvas(1);
    animCanvas.setFrames(canvasManager.getFrames());
}

/**
 * Handles click on delete button - removes canvas if found.
 * If it's the last canvas, it will be cleared instead of removed.
 * @param {Event} event - Click event from the delete button
 * @returns {void}
 */
function handleDeleteButtonClick(event) {
    let canvas = canvasManager.getEventCanvas(event);
    if (canvas) {
        canvasManager.deleteCanvas(canvas);
        animCanvas.setFrames(canvasManager.getFrames());
    } else {
        console.error("Canvas instance not found for element");
    }
}

/**
 * Handles click on copy button - duplicates canvas content.
 * Creates a new canvas and copies the content from the source canvas.
 * The new canvas is inserted after the source canvas.
 * @param {Event} event - Click event from the copy button
 * @returns {void}
 */
function handleCopyButtonClick(event) {
    let canvas = canvasManager.getEventCanvas(event);
    let index = canvasManager.getCanvasIndex(canvas);
    let canvasData = canvas.toJSON();

    canvasManager.addCanvas(1).then(([newCanvas]) => {
        newCanvas.fromJSON(canvasData);
        //position the new canvas to the right of the source canvas
        for (let i = canvasManager.canvases.length - 1; i > index + 1; i--) {
            canvasManager.swapCanvas(canvasManager.canvases[i], -1);
        }
    });
}

/**
 * Handles click on move buttons - moves canvas left or right.
 * Swaps the content of the canvas with its neighbor in the specified direction.
 * @param {Event} event - Click event from the move button
 * @param {number} direction - Direction to move (-1 for left, 1 for right)
 * @returns {void}
 */
function handleMoveButtonClick(event, direction) {
    let canvas = canvasManager.getEventCanvas(event);
    if (canvas) {
        canvasManager.swapCanvas(canvas, direction);
    } else {
        console.error("Canvas instance not found for element");
    }
}

/**
 * Loads the animation frames and FPS from a file.
 * @param {string} file - The name of the file to load
 * @returns {Promise<void>}
 */
async function loadAnimationFromFile(file) {
    if (typeof file !== "string" || file.trim() === "") {
        console.error("Invalid file name provided");
        return;
    }

    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const data = await response.json();
        if (animCanvas.JSONanimationIsValid(data)) {
            await loadAnimation(data);
        } else {
            throw new Error("Invalid JSON format");
        }
    } catch (error) {
        console.error("Error loading animation from file:", error);
    }
}

/**
 * Loads animation data into the canvases and updates the animation preview.
 * Adds or removes canvases as needed to match the number of frames.
 * @param {Object} data - Animation data containing frames and fps
 * @returns {Promise<void>}
 */
export async function loadAnimation(data) {
    if (!animCanvas.JSONanimationIsValid(data)) {
        throw new Error("Invalid JSON format");
    }
    const frames = data.frames;
    const fps = data.fps;
    const fpsInput = document.getElementById("fps");
    const fpsValue = document.getElementById("fps-value");
    fpsInput.value = fps;
    fpsValue.textContent = fps;
    animCanvas.setFPS(fps);

    let length = frames.length;
    if (canvasManager.canvases.length < length) {
        await canvasManager.addCanvas(length - canvasManager.canvases.length);
    } else if (length < canvasManager.canvases.length) {
        let difference = canvasManager.canvases.length - length;
        for (let i = 0; i < difference; i++) {
            canvasManager.deleteCanvas(canvasManager.canvases[canvasManager.canvases.length - 1]);
        }
    }
    canvasManager.canvases.forEach((canvas, index) => {
        if (frames[index]) {
            canvas.fromJSON(frames[index]);
        }
    });
    animCanvas.setFrames(canvasManager.getFrames());
    animCanvas.play();
}

/**
 * Handles click on "Load from Disk" menu item.
 * Opens a file picker and loads animation data from a selected JSON file.
 * @returns {void}
 */
function handleLoadFromDisk() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const contents = JSON.parse(reader.result);
            loadAnimation(contents);
        };
        reader.readAsText(file);
    });
    fileInput.click();
}

/**
 * Handles click on "Save to Disk" menu item.
 * Saves the current animation as a JSON file with a timestamped filename.
 * @returns {void}
 */
function handleSaveToDisk() {
    console.log("Save to Disk clicked");
    const data = animCanvas.toJSON();
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

    // Generate a timestamp in the format YYYY-MM-DD_HH-MM-SS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `animation_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Handles clearing the current animation, prompting the user if there are unsaved changes.
 * @returns {void}
 */
function handleClearAnimation() {
    let clearAnimation = async () => {
        await loadAnimationFromFile("../json/empty.json");
        unsavedChanges = false;
    };
    if (unsavedChanges) {
        const message = `Are you sure you want to clear the current animation? 
            All usaved changes will be lost.`;
        confirmAction(message, clearAnimation);
    } else clearAnimation();
}

/**
 * Shows a confirmation dialogue with a message and an action to perform if confirmed.
 * @param {string} message - The confirmation message to display
 * @param {Function} action - The action to perform if confirmed
 * @returns {void}
 */
function confirmAction(message, action) {
    let dialogue = document.querySelector("#confirmation-dialogue");
    if (dialogue) {
        dialogue.querySelector("#confirmation-message").innerHTML = message;
        dialogue._action = action;
        dialogue.style.visibility = "visible";
        dialogue.tabIndex = -1;
        dialogue.focus();
    } else {
        console.error("Dialogue not found");
    }
}

/**
 * Handles saving the current animation as a GIF file.
 * Captures each frame using html2canvas, adds it to gif.js, and triggers a download when finished.
 * @returns {Promise<void>}
 */
async function handleSaveGif() {
    var gif = new window.GIF({
        workers: 2,
        quality: 10,
        workerScript: "assets/scripts/gif.worker.js",
    });

    const delay = 1000 / animCanvas.fps;

    animCanvas.stop();
    animCanvas.setFrame(0);
    // Collect all html2canvas promises
    const framePromises = [];
    for (let i = 0; i < animCanvas.getFrameCount(); i++) {
        framePromises.push(
            html2canvas(animCanvasElement)
                .then((canvas) => {
                    gif.addFrame(canvas, { delay: delay });
                })
                .catch((error) => {})
        );
        animCanvas.nextFrame();
    }

    // Wait for all frames to be added
    await Promise.all(framePromises);

    gif.on("finished", function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "animation.gif";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    gif.render();
    animCanvas.play();
}
