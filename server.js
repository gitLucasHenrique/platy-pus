const express = require('express');
const fs = require('fs');
const server = express();
require('dotenv').config();

let jsonAnimes = fs.readFile(__dirname + '/assets/json/animeList.json', function(err, data){
    if(err) throw err;
    console.log(data);
})

console.log(jsonAnimes);

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/teste', (req, res) => {
    console.log(jsonAnimes)
    res.send({"aaaa":"aaaaa"})
});

server.get('/api/animeList', (req, res) => {
    res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
    res.send
    res.sendFile('/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));
