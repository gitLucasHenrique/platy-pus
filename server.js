const express = require('express');
const fs = require('fs');
const server = express();
require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const URL = 'https://www.animestc.com/'

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/teste', (req, res) => {
    fetch('http://localhost:3000/api/animeList')
    .then(res => res.json())
    .then(json => res.send(json));
});

server.get('/getAnime', (req, res) => {
    fetch(URL)
    .then(res => res.text())
    .then((text) => {
        let strAnimeList = '{\"animes\": ' + JSON.stringify(workData(text)) + '}';
        fs.writeFile('./assets/json/animeList.json', strAnimeList, function(err){
            if(err){
                console.log('failed to write file due: ', err);
            }
        });
        res.send({"output":[{"action":"generate Anime List","status":"success"}]})
    })
    .catch(function(error) {
        log('Request failed', error)
        res.send({"output":[{"action":"generate Anime List","status":"failed"}]})
    });
});

server.get('/api/animeList', (req, res) => {
    res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
    res.sendFile(__dirname + '/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));

function workData(data){
    let $ = cheerio.load(data);
    let animeList = [];
    let animeNames = [];
    let animeDaysOTW = [];
    let animeImgs = [];
    
    $('.atualizacoes-content').find('.anime-transmissao-nome').each(function(i, value){
        animeNames.push($('h4', this).text());
    });
    $('.atualizacoes-content').find('.transmissao-container').each(function(i, value){
        animeDaysOTW.push($(value, this).attr('data-semana'));
    });
    $('.atualizacoes-content').find('.transmissao-container').find('.anime-transmissao-container').find('img').each(function(i, value){
        animeImgs.push($(value, this).attr('data-src'));
    });

    for ( i = 0; i < $('.atualizacoes-content').find('.transmissao-container').length; i++){
        animeList[i] = { name : animeNames[i], dayOTW : animeDaysOTW[i], img : animeImgs[i] };
    }
    return animeList;
}