# ASCIImator

ASCIImator is a web-based ASCII animation editor that allows users to create, edit, preview, and export ASCII art animations. 

## Features

- **Multi-frame ASCII animation editor**: Add, delete, copy, and reorder frames.
- **Live animation preview**: See your animation play in real time.
- **Frame navigation**: Move frames left or right, duplicate, or remove them.
- **FPS control**: Adjust the animation speed with an intuitive slider.
- **Gallery**: Browse and load sample animations.
- **Save/Load**: Export and import animations as JSON files.
- **Export to GIF**: Download your animation as a GIF.

## Project Structure

```
ASCIImator/
├── .gitignore
├── README.md
└── app/
    ├── html/
    │   ├── animationCard.html
    │   ├── editableCanvas.html
    │   ├── gallery.html
    │   └── index.html
    ├── json/
    │   ├── empty.json
    │   ├── gallery_files.json
    │   └── ..other .json animation files
    ├── scripts/
    │   ├── animCanvas.js
    │   ├── canvas.js
    │   ├── canvasManager.js
    │   ├── client.js
    │   ├── editableCanvas.js
    │   ├── gallery.js
    │   └── gif.worker.js
    └── style/
        ├── style-gallery.css
        ├── style.css
        └── tooSmall.css
```
### Usage

- Open `app/html/index.html` in your browser via your local server.
- Use the editor to create and preview ASCII animations.
- Save your work as JSON or export as GIF.
- Browse the gallery for inspiration or to load sample animations.

## Scripts Overview

- [`app/scripts/client.js`](app/scripts/client.js): Main application logic and UI event handling.
- [`app/scripts/canvasManager.js`](app/scripts/canvasManager.js): Manages multiple editable canvases (frames).
- [`app/scripts/editableCanvas.js`](app/scripts/editableCanvas.js): Interactive canvas for editing ASCII art.
- [`app/scripts/animCanvas.js`](app/scripts/animCanvas.js): Animation preview and playback logic.
- [`app/scripts/gallery.js`](app/scripts/gallery.js): Gallery page logic.

## Dependencies

- [gif.js](https://github.com/jnordberg/gif.js) - GIF encoding
- [`gif.worker.js`](https://github.com/jnordberg/gif.js/blob/master/dist/gif.worker.js) - Hosted locally to avoid CORS issues with CDN-hosted workers
- [html2canvas](https://github.com/niklasvh/html2canvas) - DOM to canvas rendering

## Notes

- The app is not optimized for mobile devices or small screens.

