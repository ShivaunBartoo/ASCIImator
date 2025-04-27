import { AnimCanvas } from "./animCanvas.js";

const canvasWidth = 12;
const canvasHeight = 8;

loadContent();

/**
 * Asynchronously loads animation content and dynamically populates the animation card container.
 *
 * This function fetches a list of animation file names from a JSON file, retrieves the animation data
 * for each file, and uses a template HTML file to create and populate animation cards. Each card
 * includes a canvas element to display the animation and a button to load the animation into the main
 * application.
 *
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the content is fully loaded and rendered.
 */
async function loadContent() {
    const container = document.querySelector("#animation-card-container");

    // Use correct relative paths from /assets/scripts/ to /assets/json/ and /assets/html/
    const files = await fetch("../json/gallery_files.json").then((response) => response.json());
    const animations = await Promise.all(
        files.map((file) => fetch(`../json/${file}`).then((response) => response.json()))
    );

    fetch("../html/animationCard.html")
        .then((response) => response.text())
        .then((html) => {
            let template = document.createElement("template");
            template.innerHTML = html;

            for (let animation of animations) {
                let card = template.content.firstElementChild.cloneNode(true);

                container.appendChild(card);
                let canvasElement = card.querySelector(".canvas");

                let newCanvas = new AnimCanvas(
                    canvasElement,
                    canvasWidth,
                    canvasHeight,
                    1,
                    animation.frames,
                    animation.fps
                );
                newCanvas.play();

                card.querySelector(".load-button").addEventListener("click", () => {
                    localStorage.setItem("pendingAnimation", JSON.stringify(animation));
                    window.location.href = "/index.html";
                });
            }
        });
}
