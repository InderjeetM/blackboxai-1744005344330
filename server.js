const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8000;

// Serve static files
app.use(express.static('.'));

// API endpoint to list folder contents
app.get('/api/list-folder', (req, res) => {
    const folder = req.query.folder;
    const validFolders = ['client_faces', 'dress_images'];
    
    if (!validFolders.includes(folder)) {
        return res.status(400).json({ error: 'Invalid folder specified' });
    }

    const folderPath = path.join(__dirname, 'virtual_folders', folder);
    
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading folder' });
        }
        res.json({ files });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});