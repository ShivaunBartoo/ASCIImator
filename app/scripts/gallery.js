import { AnimCanvas } from "./animCanvas.js";

const canvasWidth = 12;
const canvasHeight = 8;

loadContent();

async function loadContent() {
    const container = document.querySelector("#animation-card-container");

    const files = await fetch("../json/gallery_files.json").then((response) => response.json());
    const animations = await Promise.all(
        files.map((file) => fetch(`../json/${file}`).then((response) => response.json()))
    );

    fetch("./animationCard.html")
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
                    window.location.href = "index.html";
                });
            }
        });
}
