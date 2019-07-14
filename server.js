const express = require('express');
const fs = require('fs');
const server = express();
require('dotenv').config();
const fetch = require('node-fetch');

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/teste', (req, res) => {
    fetch('http://localhost:3000/api/animeList')
    .then(res => res.json())
    .then(json => res.send(json));
});

server.get('/api/animeList', (req, res) => {
    res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
    res.sendFile(__dirname + '/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));
