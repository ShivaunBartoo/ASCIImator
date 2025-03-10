const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Serve static files from the "public" directory
app.use(express.static("./public"));
// Parses JSON bodies
app.use(express.json());

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html"));
});

// Endpoint to save canvas data to a file
app.post("/save", (req, res) => {
    const saveData = req.body;
    let fileName = req.query.filename || "default.json";

    // Sanitize the file name
    fileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "");

    const filePath = path.join(__dirname, "public", "json", fileName);

    // Write the canvas data to the specified file
    fs.writeFile(filePath, JSON.stringify(saveData), (err) => {
        if (err) {
            console.error("Error saving canvas data:", err);
            res.status(500).send("Error saving canvas data");
        } else {
            res.status(200).send("Canvas data saved successfully");
        }
    });
});

// Endpoint to list all JSON files in the "public/json" directory
app.get("/listfiles", (req, res) => {
    const dirPath = path.join(__dirname, "public", "json");

    // Read the directory and return the list of files
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            res.status(500).send("Error reading directory");
        } else {
            res.status(200).json(files);
        }
    });
});

// Start the server and listen on port 8000
app.listen(8000, () => {
    console.log("Server is listening on port 8000...");
});
