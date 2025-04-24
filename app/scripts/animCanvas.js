import { Canvas } from "./canvas.js";

/**
 * AnimCanvas class, extends Canvas to provide animation functionality.
 */
export class AnimCanvas extends Canvas {
    #frames;

    /**
     * Constructor for AnimCanvas.
     * @param {HTMLElement} element - The HTML element to use as the canvas.
     * @param {number} width - The width of the canvas.
     * @param {number} height - The height of the canvas.
     * @param {number} scale - The scale of the canvas.
     * @param {Array<object>} frames - An array of frame data for the animation.
     * @param {number} fps - Frames per second for the animation.
     */
    constructor(element, width, height, scale, frames, fps) {
        super(element, width, height, scale);
        this.#frames = Array.isArray(frames) ? frames : [];
        this.fps = fps;
        this.currentFrameIndex = 0;
        this.intervalId = null;
    }

    toJSON() {
        return { fps: Number(this.fps), frames: this.#frames };
    }

    /**
     * Sets the JSON data for the animation.
     * @param {Object} json - JSON object containing animation data.
     * @throws {Error} If the JSON format is invalid.
     */
    fromJSON(json) {
        if (!this.JSONanimationIsValid(json)) {
            throw new Error("Invalid JSON format");
        }
        this.fps = json.fps;
        this.#frames = json.frames;
        this.currentFrameIndex = 0;
        this.play();
    }

    async fromFile(file) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }
            const json = await response.json();
            if (this.JSONanimationIsValid(json)) {
                this.fromJSON(json);
            } else {
                throw new Error("Invalid file.");
            }
        } catch (error) {
            console.error("Error loading file:", error);
        }
    }

    /**
     * Sets the current frame to the specified index.
     * @param {number} index - The index of the frame to set.
     */
    setFrame(index) {
        if (index >= 0 && index < this.#frames.length) {
            this.currentFrameIndex = index;
            super.fromJSON(this.#frames[index]);
        }
    }

    /**
     * Advances to the next frame in the animation.
     * Loops back to the first frame if the current frame is the last frame.
     */
    nextFrame() {
        this.setFrame(
            this.currentFrameIndex < this.#frames.length - 1 ? this.currentFrameIndex + 1 : 0
        );
    }

    /**
     * Validates the structure of a JSON object for the animation.
     * @param {Object} json - JSON object to validate.
     * @returns {boolean} True if the JSON object is valid, false otherwise.
     */
    JSONanimationIsValid(json) {
        if (typeof json !== "object" || json === null) {
            console.error("Invalid JSON: Expected an object.");
            return false;
        }
        if (isNaN(Number(json.fps)) || Number(json.fps) <= 0) {
            console.error("Invalid JSON: 'fps' should be a positive number.");
            return false;
        }
        if (!Array.isArray(json.frames)) {
            console.error("Invalid JSON: 'frames' should be an array.");
            return false;
        }
        for (let frame of json.frames) {
            if (!super.JSONisValid(frame)) {
                console.error("Invalid JSON: One or more frames are invalid.");
                return false;
            }
        }
        return true;
    }

    /**
     * Sets the frames for the animation.
     * @param {Array<object>} frames - An array of frame data.
     * @throws {Error} If frames is not an array or if a frame is invalid.
     */
    setFrames(frames) {
        if (!Array.isArray(frames)) {
            throw new Error("Frames should be an array");
        }
        for (const frame of frames) {
            if (!super.JSONisValid(frame)) {
                throw new Error("Invalid frame format");
            }
        }
        this.#frames = frames;
    }

    /**
     * Sets the frames per second for the animation and restarts the animation.
     * @param {number} fps - The frames per second.
     */
    setFPS(fps) {
        this.fps = fps;
        this.play();
    }

    /**
     * Starts the animation.
     */
    play() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.setFrame(this.currentFrameIndex);
        this.intervalId = setInterval(() => this.nextFrame(), 1000 / this.fps);
    }

    /**
     * Stops the animation.
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
