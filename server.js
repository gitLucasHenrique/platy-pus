const express = require('express');
const fs = require('fs');
const server = express();
require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const URL = 'https://www.animestc.com/'
const Cloudant = require('@cloudant/cloudant');
const dbname = 'animes'
const id = 'animes:list'
//var dbCred = require('./dbCredentials.json');

var cloudant = new Cloudant({
    account: process.env.DB_USERNAME,
    plugins: {
      iamauth: {
        iamApiKey: process.env.DB_APIKEY
      }
    }
});

server.get('/' || '/home' || '/index', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

server.get('/api/animeListFromDB', (req, res) => {
    cloudant.use(dbname).get(id, (err, data) => {
        if (err) {
          console.log(err);
          res.send({"output":[{"action":"get Anime List From DB","status":"failed"}]})
        } else {
          console.log(data); // { ok: true, id: 'rabbit', ...
          res.send(data)
        }
      })
});

server.get('/api/getAnimeList', (req, res) => {
    fetch(URL)
    .then(res => res.text())
    .then((text) => {
        let strAnimeList = '{\"_id\":"animes:list", \"animes\": ' + JSON.stringify(workData(text)) + '}';
        fs.writeFile('./assets/json/animeList.json', strAnimeList, function(err){
            if(err){
                console.log('failed to write file due: ', err);
            }
        });
        cloudant.use(dbname).insert(JSON.parse(strAnimeList), (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log(data); // { ok: true, id: 'rabbit', ...
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
    let animeHoraBR = [];
    let animeHoraJP = [];
    let animeReleaseDate = [];
    
    $('.atualizacoes-content').find('.anime-transmissao-nome').each(function(i, value){
        animeNames.push($('h4', this).text());
    });
    $('.atualizacoes-content').find('.transmissao-container').each(function(i, value){
        animeDaysOTW.push($(value, this).attr('data-semana'));
    });
    $('.atualizacoes-content').find('.transmissao-container').find('.anime-transmissao-container').find('img').each(function(i, value){
        animeImgs.push($(value, this).attr('data-src'));
    });
    $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function(i, value){
      animeHoraBR.push($(value, this).attr('data-horariobr'));
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function(i, value){
      animeHoraJP.push($(value, this).attr('data-horariojp'));
      //console.log("valo da iteracao" + i + " " + $(value, this).attr('data-horariojp'))
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function(i, value){
      if ($(value, this).attr('data-lancamento') === "0"){
          console.log(animeReleaseDate)
          animeReleaseDate.push("?")
      }else{
          animeReleaseDate.push($(value, this).attr('data-lancamento'));
      }
  });

    for ( i = 0; i < $('.atualizacoes-content').find('.transmissao-container').length; i++){
      animeList[i] = { name : animeNames[i], dayOTW : animeDaysOTW[i], img : animeImgs[i],
        transmiBR : animeHoraBR[i], transmiJP : animeHoraJP[i], animeReleaseDate : animeReleaseDate[i] };
    }
    return animeList;
}

function listDB(){
    cloudant.db.list(function(err, body) {
        body.forEach(function(db) {
          console.log(db);
        });
      });
}

function createDB(dbname){
    cloudant.db.create(dbname, function (err, data) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Data:', data);
        }
        db = cloudant.db.use(dbname);
    });
}

function insertDoc(dbname,doc){
    cloudant.use(dbname).insert(doc, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data); // { ok: true, id: 'rabbit', ...
        }
      });
}

function getDoc(dbname,id){
    cloudant.use(dbname).get(id, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data.animes); // { ok: true, id: 'rabbit', ...
        }
      });
}
