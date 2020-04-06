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
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhonex = devices['iPhone X'];
const pixel2 = devices['Pixel 2 XL'];
//var dbCred = require('./dbCredentials.json');

let cloudant = new Cloudant({
  account: process.env.DB_USERNAME,
  plugins: {
    iamauth: {
      iamApiKey: process.env.DB_APIKEY
    }
  }
});
const myDB = cloudant.db.use(dbname);

server.use(express.json());

server.get('/' || '/home' || '/index', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

server.post('/api/checkUserFav', (req, res) => {
  let animeDB = cloudant.db.use("users");
  animeDB.get(req.body.id_user, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      let isFav = false;
      data.animes.forEach(element => {
        if (element.name == req.body.animeName) isFav = true;
      });
      res.send(isFav);
    }
  })
});

server.post('/api/getUser', (req, res) => {
  let animeDB = cloudant.db.use("users");
  animeDB.get(req.body.id_user, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ "animes": data.animes });
    }
  })
});

server.post('/api/deleteUser', (req, res) => {
  let animeDB = cloudant.db.use("users");
  let queryUser = {
    "selector": {
      "_id": {
        "$eq": req.body.id_user
      }
    }
  }
  animeDB.get(req.body.id_user, function (err, data) {
    if (!err) {
      animeDB.destroy(data._id, data._rev, function (err, body) {
        if (!err) {
          res.send(body)
        }
        else {
          res.send({ action: "remove user from DB", status: "failed" })
        }
      })
    } else {
      res.send({ action: "remove user from DB", status: "failed - user not found" })
    }
  });
});

server.put('/api/addUser', (req, res) => {
  let animeDB = cloudant.db.use("users");
  let queryUser = {
    "selector": {
      "_id": {
        "$eq": req.body.id_user
      }
    }
  }
  animeDB.find(queryUser).then(function (data) {
    if (data.docs.length == 0) {
      let newUser = {
        "_id": req.body.id_user,
        "deviceType": req.body.deviceType,
        "animes": []
      }
      animeDB.insert(newUser, function (err) {
        if (err) {
          res.send(err);
        }
        else {
          res.send({ action: "check user DB", status: "added new user" });
        }
      })
    } else {
      res.send({ action: "check user DB", status: "user already exists" });
    }
  }).catch(function (err) {
    res.send(err);
  });
});

server.post('/api/addAnime', (req, res) => {
  let userDB = cloudant.db.use("users");
  console.log(req.body)
  let queryAnimes = {
    "selector": {
      "_id": {
        "$eq": req.body.id_user
      }
    }
  }
  userDB.find(queryAnimes).then(function (data) {
    let newAnime = {
      "name": req.body.anime.name,
      "img": req.body.anime.img,
      "dayOTW": req.body.anime.dayOTW
    }
    let index = data.docs[0].animes.findIndex(x => x.name == newAnime.name);
    if (index === -1) {
      data.docs[0].animes.push(newAnime);
      userDB.insert(data.docs[0], function (err) {
        if (err) {
          res.send(err);
        } else {
          res.send({ action: "add anime to user DB", status: "success" })
        }
      });
    }
    else {
      data.docs[0].animes.forEach(function (element, index) {
        (element.name == req.body.anime.name) ? data.docs[0].animes.splice(index, 1) : null
      });
      userDB.insert(data.docs[0], function (err) {
        if (err) {
          res.send(err);
        } else {
          res.send({ action: "add anime to user DB", status: "anime already exist, removing..." })
        }
      });
    }

  }).catch(function (err) {
    res.send(err);
  })
});

server.get('/api/animeListFromDB', (req, res) => {
  cloudant.use(dbname).get(id, (err, data) => {
    if (err) {
      console.log(err);
      res.send({ "output": [{ "action": "get Anime List From DB", "status": "failed" }] })
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
      fs.writeFile('./assets/json/animeList.json', strAnimeList, function (err) {
        if (err) {
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
      res.send({ "output": [{ "action": "generate Anime List", "status": "success" }] })
    })
    .catch(function (error) {
      log('Request failed', error)
      res.send({ "output": [{ "action": "generate Anime List", "status": "failed" }] })
    });
});

server.get('/api/getAnimeListPuppeteer', (req, res) => {
  function teste(url) {
    (async () => {
      const browser = await puppeteer.launch({
        args: [
          //'--start-maximized' // you can also use '--start-fullscreen'
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ], headless: true
      });
      const pagina1 = await browser.newPage();

      await pagina1.setViewport({ width: 1366, height: 768 });
      await pagina1.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
      const result = await pagina1.evaluate(() => {
        let animesList = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];

        document.querySelectorAll('div.transmissao-container > a')
          .forEach(animeUrl => animesUrl.push(animeUrl.getAttribute('href')));
        document.querySelectorAll('div.transmissao-container > a > div.anime-transmissao-container > div.anime-transmissao-nome > h4')
          .forEach(animeName => animesNames.push(animeName.innerHTML));
        document.querySelectorAll('div.atualizacoes-content div.transmissao-container')
          .forEach(animeDayOTW => {
            (animeDayOTW.getAttribute('data-semana') == "7") ?
              animesDaysOTW.push("0") :
              animesDaysOTW.push(animeDayOTW.getAttribute('data-semana'));
          });
        document.querySelectorAll('div.atualizacoes-content div.transmissao-container a div.anime-transmissao-container img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        document.querySelectorAll('div.transmissao-container > div.transmissao-horario')
          .forEach(animeHoraBR => animesHoraBR.push(animeHoraBR.getAttribute('data-horariobr')));
        document.querySelectorAll('div.transmissao-container > div.transmissao-horario')
          .forEach(animeHoraJP => animesHoraJP.push(animeHoraJP.getAttribute('data-horariojp')));
        document.querySelectorAll('div.transmissao-container > div.transmissao-horario')
          .forEach(animeRealeaseDate => animesReleaseDate.push(animeRealeaseDate.getAttribute('data-lancamento')));

        for (let i = 0; i < animesUrl.length; i++) {
          animesList[i] = {
            url: animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        console.log(animesList.length);
        return animesList;
      })
      await pagina1.close();
      let i = 0;
      //console.log(result)
      while (i < result.length) {
        try {
          let teste = await browser.newPage();
          await teste.goto(result[i].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await teste.evaluate(() => {
            let animeDetails = [];
            document.querySelectorAll('div.pag-anime-dados-direita > ul > li')
              .forEach(ele => animeDetails.push(ele.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '')))
            return animeDetails;
          })
          result[i].numeroEpisodios = resultDetails[0]
          result[i].generos = resultDetails[1]
          result[i].classificacao = resultDetails[2].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[2].includes("18")
              ? "18"
              : resultDetails[2].split(" ")[0]
          result[i].anoLancamento = resultDetails[3]
          result[i].estudio = resultDetails[4]
          result[i].statusAtual = resultDetails[5]
          result[i].sinopse = (resultDetails[7]) ? resultDetails[7] : resultDetails[6]
          await teste.close();
          i++;
        } catch (err) {
          console.error(err);
        }
      }
      addAnimesToDB({ _id: "animes:list", animes: result }, myDB)
      await browser.close();
    })();
  }

  function addAnimesToDB(animes, db) {
    let query = {
      "selector": {
        "_id": {
          "$eq": animes._id
        }
      },
      "fields": [
        "_id",
        "_rev"
      ]
    };
    db.find(query).then(function (data) {
      if (data.docs.length != 0) {
        animes._rev = data.docs[0]._rev;
        db.insert(animes, function (err) {
          if (err) {
            console.log(err);
          } else console.log("inserido com sucesso com rev anterior " + data.docs[0]._rev);
        })
      } else {
        db.insert(animes, function (err) {
          if (err) {
            console.log(err);
          } else console.log("inserido com sucesso");
        })
      };
    });

  }

  teste(URL);
  res.send("success!")
});

server.get('/api/animeList', (req, res) => {
  res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
  res.sendFile(__dirname + '/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));

function workData(data) {
  let $ = cheerio.load(data);
  let animeList = [];
  let animeNames = [];
  let animeDaysOTW = [];
  let animeImgs = [];
  let animeHoraBR = [];
  let animeHoraJP = [];
  let animeReleaseDate = [];

  $('.atualizacoes-content').find('.anime-transmissao-nome').each(function (i, value) {
    animeNames.push($('h4', this).text());
  });
  $('.atualizacoes-content').find('.transmissao-container').each(function (i, value) {
    animeDaysOTW.push($(value, this).attr('data-semana'));
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.anime-transmissao-container').find('img').each(function (i, value) {
    animeImgs.push($(value, this).attr('data-src'));
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function (i, value) {
    animeHoraBR.push($(value, this).attr('data-horariobr'));
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function (i, value) {
    animeHoraJP.push($(value, this).attr('data-horariojp'));
    //console.log("valo da iteracao" + i + " " + $(value, this).attr('data-horariojp'))
  });
  $('.atualizacoes-content').find('.transmissao-container').find('.transmissao-horario').each(function (i, value) {
    if ($(value, this).attr('data-lancamento') === "0") {
      console.log(animeReleaseDate)
      animeReleaseDate.push("?")
    } else {
      animeReleaseDate.push($(value, this).attr('data-lancamento'));
    }
  });

  for (i = 0; i < $('.atualizacoes-content').find('.transmissao-container').length; i++) {
    animeList[i] = {
      name: animeNames[i], dayOTW: animeDaysOTW[i], img: animeImgs[i],
      transmiBR: animeHoraBR[i], transmiJP: animeHoraJP[i], animeReleaseDate: animeReleaseDate[i]
    };
  }
  return animeList;
}

function listDB() {
  cloudant.db.list(function (err, body) {
    body.forEach(function (db) {
      console.log(db);
    });
  });
}

function createDB(dbname) {
  cloudant.db.create(dbname, function (err, data) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Data:', data);
    }
    db = cloudant.db.use(dbname);
  });
}

function insertDoc(dbname, doc) {
  cloudant.use(dbname).insert(doc, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data); // { ok: true, id: 'rabbit', ...
    }
  });
}

function getDoc(dbname, id) {
  cloudant.use(dbname).get(id, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data.animes); // { ok: true, id: 'rabbit', ...
    }
  });
}
