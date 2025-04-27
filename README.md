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
├── index.html
├── assets/
│   ├── html/
│   │   ├── animationCard.html
│   │   ├── editableCanvas.html
│   │   └── gallery.html
│   ├── scripts/
│   │   ├── animCanvas.js
│   │   ├── canvas.js
│   │   ├── canvasManager.js
│   │   ├── client.js
│   │   ├── editableCanvas.js
│   │   ├── gallery.js
│   │   └── gif.worker.js
│   ├── styles/
│   │   ├── style-gallery.css
│   │   ├── style.css
│   │   └── tooSmall.css
│   └── json/
│       ├── animation.json
│       ├── bouncing_ball.json
│       ├── bouncing_ball_24.json
│       ├── empty.json
│       ├── gallery_files.json
│       ├── sleepy_cat.json
│       ├── snake.json
│       └── super_ball.json
├── README.md
└── todo.txt
```
### Usage

- Open `index.html` in your browser (served from the project root).
- Use the editor to create and preview ASCII animations.
- Save your work as JSON or export as GIF.
- Browse the gallery for inspiration or to load sample animations.

## Scripts Overview

- [`assets/scripts/client.js`](assets/scripts/client.js): Main application logic and UI event handling.
- [`assets/scripts/canvasManager.js`](assets/scripts/canvasManager.js): Manages multiple editable canvases (frames).
- [`assets/scripts/editableCanvas.js`](assets/scripts/editableCanvas.js): Interactive canvas for editing ASCII art.
- [`assets/scripts/animCanvas.js`](assets/scripts/animCanvas.js): Animation preview and playback logic.
- [`assets/scripts/gallery.js`](assets/scripts/gallery.js): Gallery page logic.

## Dependencies

- [gif.js](https://github.com/jnordberg/gif.js) - GIF encoding
- [`gif.worker.js`](https://github.com/jnordberg/gif.js/blob/master/dist/gif.worker.js) - Hosted locally to avoid CORS issues with CDN-hosted workers
- [html2canvas](https://github.com/niklasvh/html2canvas) - DOM to canvas rendering

## Notes

- The app is not optimized for mobile devices or small screens.

