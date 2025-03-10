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

    /**
     * Sets the current frame to the specified index.
     * @param {number} index - The index of the frame to set.
     */
    setFrame(index) {
        if (index >= 0 && index < this.#frames.length) {
            this.currentFrameIndex = index;
            this.fromJSON(this.#frames[index]);
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
     * Sets the frames for the animation.
     * @param {Array<object>} frames - An array of frame data.
     * @throws {Error} If frames is not an array or if a frame is invalid.
     */
    setFrames(frames) {
        if (!Array.isArray(frames)) {
            throw new Error("Frames should be an array");
        }
        for (const frame of frames) {
            if (!this.JSONisValid(frame)) {
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
