export function loadCanvas(selector, width, height) {
    document.querySelectorAll(selector).forEach((element) => {
        element.innerHTML = getCanvasHTML(width, height);
    });
}

function getCanvasHTML(width, height) {
    let html = "<table class='canvas'>";
    for (let i = 0; i < height; i++) {
        html += "<tr>";
        for (let j = 0; j < width; j++) {
            html += `<td class="character" data-x="${j}" data-y="${i}"> </td>`;
        }
        html += "</tr>";
    }
    html += "</table>";
    return html;
}
