const express = require('express');
const app = express();
const path = require('path')

app.use(express.static('./public'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(8000, () => {
    console.log('server is listening on port 8000....')
});