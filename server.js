const express = require('express');
const fs = require('fs');
const server = express();
require('dotenv').config();

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/api/animeList', (req, res) => {
    res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
    res.sendFile('/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));
