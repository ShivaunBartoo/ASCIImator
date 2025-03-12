import { CanvasManager } from "./canvasManager.js";
import { AnimCanvas } from "./animCanvas.js";

const canvasManager = new CanvasManager("#canvases", 12, 8);
const animCanvasElement = document.querySelector("#anim-canvas");
const animCanvas = new AnimCanvas(animCanvasElement, 12, 8, 2, [{}], 6);

async function initializeApp() {
    // Handle Canvas updates
    document.addEventListener("CanvasUpdated", (event) => {
        if (event.detail.canvas !== animCanvas) {
            try {
                const frames = canvasManager.getFrames();
                animCanvas.setFrames(frames);
            } catch (err) {
                console.error("Error updating frames:", err);
            }
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        //Add dropdown menu behavior
        const dropdowns = document.querySelectorAll(".dropdown");

        dropdowns.forEach((dropdown) => {
            const dropdownButton = dropdown.querySelector(".dropdown-button");
            const dropdownContent = dropdown.querySelector(".dropdown-content");

            //toggle visibility when button is clicked
            dropdownButton.addEventListener("click", function () {
                dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
            });

            //if visible and clicked outside, hide
            document.addEventListener("click", function (event) {
                if (!dropdown.contains(event.target)) {
                    dropdownContent.style.display = "none";
                }
            });

            // Add event listeners to the dropdown content items
            const dropdownItems = dropdownContent.querySelectorAll("button");
            dropdownItems.forEach((item) => {
                item.addEventListener("click", function () {
                    dropdownContent.style.display = "none"; // Hide the dropdown
                });
            });
        });

        populateLoadDropdown();

        // Set event listeners for the FPS slider
        const fpsInput = document.getElementById("fps");
        const fpsValue = document.getElementById("fps-value");

        // Initialize the display with the initial value
        fpsValue.textContent = fpsInput.value;

        // Update the display whenever the range input changes
        fpsInput.addEventListener("input", function () {
            fpsValue.textContent = fpsInput.value;
            animCanvas.setFPS(fpsInput.value);
        });
    });

    // Handle clicks
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
        // Handle Save menu item clicks
        else if (event.target.closest(".save-to-server")) {
            handleSaveToServer();
        } else if (event.target.closest(".save-to-disk")) {
            handleSaveToDisk();
        }
        // Handle Load menu item clicks
        // Note: event listeners added dynamically for server-side json files in menu
        else if (event.target.closest(".load-from-disk")) {
            handleLoadFromDisk(event);
        }
    });

    // Initialize canvases
    await canvasManager.initialize(3);
    animCanvas.play();
}

// Initialize the app
initializeApp();

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
 * Handles click on "Save to Disk" menu item
 * Placeholder function for saving animation data to disk
 */
function handleSaveToDisk() {
    console.log("Save to Disk clicked");
    // TODO: Implement save to disk functionality
}

/**
 * Handles click on "Load from Server" menu item
 * Loads the animation frames and FPS from the server
 * @param {string} file - The name of the file to load
 */
async function handleLoadFromServer(file) {
    fetch(`/json/${file}`)
        .then((response) => response.json())
        .then(async (data) => {
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
        });
}

/**
 * Handles click on "Load from Disk" menu item
 * Placeholder function for loading animation data from disk
 */
function handleLoadFromDisk() {
    console.log("Load from Disk clicked");
    // TODO: Implement load from disk functionality
}
