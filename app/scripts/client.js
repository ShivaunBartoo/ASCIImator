import { CanvasManager } from "./canvasManager.js";
import { AnimCanvas } from "./animCanvas.js";

const canvasManager = new CanvasManager("#canvases", 12, 8);
const animCanvasElement = document.querySelector("#anim-canvas");
const tooSmallCanvasElement = document.querySelector("#too-small-canvas");
const tooSmallCanvas = new AnimCanvas(tooSmallCanvasElement, 12, 8, 1, [{}], 6);
const tooSmallAnimation = `../json/sleepy_cat.json`;
const animCanvas = new AnimCanvas(animCanvasElement, 12, 8, 2, [{}], 6);
let unsavedChanges = false;

initializeApp();

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

function setupFPSControls() {
    const fpsInput = document.getElementById("fps");
    const fpsValue = document.getElementById("fps-value");

    fpsValue.textContent = fpsInput.value;

    fpsInput.addEventListener("input", function () {
        fpsValue.textContent = fpsInput.value;
        animCanvas.setFPS(fpsInput.value);
    });
}

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
        }
    });
}

function setupConfirmationDialogue() {
    let dialogue = document.querySelector("#confirmation-dialogue");
    if (dialogue) {
        dialogue.addEventListener("click", (event) => {
            if (event.target.closest("#cancel")) {
                dialogue.style.visibility = "";
            }
            if (event.target.closest("#confirm")) {
                dialogue.style.visibility = "";
                if (typeof dialogue._action === "function") {
                    dialogue._action();
                    dialogue._action = null;
                }
            }
        });
    }
}

async function initializeCanvases() {
    await canvasManager.initialize(3);
    animCanvas.play();
}

async function handleOpenGallery() {
    if (unsavedChanges) {
        const message = `Are you sure you want to leave this page? 
        All usaved changes will be lost.`;
        confirmAction(message, () => (window.location.href = `./gallery.html`));
    } else {
        window.location.href = `./gallery.html`;
    }
}

/**
 * Handles click on add button - creates a new canvas
 */
function handleAddButtonClick() {
    canvasManager.addCanvas(1);
}

/**
 * Handles click on delete button - removes canvas if found
 * If it's the last canvas, it will be cleared instead of removed
 * @param {Event} event - Click event from the delete button
 */
function handleDeleteButtonClick(event) {
    let canvas = canvasManager.getEventCanvas(event);
    if (canvas) {
        canvasManager.deleteCanvas(canvas);
    } else {
        console.error("Canvas instance not found for element");
    }
}

/**
 * Handles click on copy button - duplicates canvas content
 * Creates a new canvas and copies the content from the source canvas
 * The new canvas is inserted after the source canvas
 * @param {Event} event - Click event from the copy button
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
 * Handles click on move buttons - moves canvas left or right
 * Swaps the content of the canvas with its neighbor in the specified direction
 * @param {Event} event - Click event from the move button
 * @param {number} direction - Direction to move (-1 for left, 1 for right)
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
 * Handles click on "Save to Server" menu item
 * Saves the current animation frames and FPS to the server
 */
async function handleSaveToServer() {
    const frames = canvasManager.getFrames();
    const defaultName = "animation";
    const userName = prompt("Enter the file name:", defaultName) || defaultName;
    const fileName = `${userName}.json`;
    const fps = document.getElementById("fps").value;

    const saveData = {
        fps: fps,
        frames: frames,
    };

    try {
        const response = await fetch(`/save?filename=${fileName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData),
        });

        if (response.ok) {
            populateLoadDropdown();
        } else {
            console.error("Failed to save canvas data to server:", response.status);
        }
    } catch (error) {
        console.error("Error saving canvas data:", error);
    }
}

/**
 * Updates the load dropdown with the list of available files from the server
 */
async function populateLoadDropdown() {
    try {
        const response = await fetch("/listfiles");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        const loadDropdown = document.querySelector("#load-content");
        loadDropdown.innerHTML = "";

        files.forEach((file) => {
            const button = document.createElement("button");
            button.className = "load-from-server";
            button.textContent = file;
            button.addEventListener("click", () => handleLoadFromServer(file)); // Attach click event
            loadDropdown.appendChild(button);
        });
    } catch (error) {
        console.error("Failed to fetch file list:", error);
    }
}

/**
 * Loads the animation frames and FPS from a file
 * @param {string} file - The name of the file to load
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
            canvasManager.deleteCanvas(canvasManager.canvases[0]);
        }
    }
    canvasManager.canvases.forEach((canvas, index) => {
        if (frames[index]) {
            canvas.fromJSON(frames[index]);
            canvas.dispatchCanvasUpdatedEvent();
        }
    });
    animCanvas.setFrames(canvasManager.getFrames());
    animCanvas.play();
}

/**
 * Handles click on "Load from Disk" menu item
 * Placeholder function for loading animation data from disk
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
 * Handles click on "Save to Disk" menu item
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

function confirmAction(message, action) {
    let dialogue = document.querySelector("#confirmation-dialogue");
    if (dialogue) {
        dialogue.querySelector("#confirmation-message").innerHTML = message;
        dialogue._action = action;
        dialogue.style.visibility = "visible";
    } else {
        console.error("Dialogue not found");
    }
}
