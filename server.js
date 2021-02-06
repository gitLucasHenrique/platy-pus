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

server.get('/api/getAnimeListPuppeteer', (req, res) => {
  function getAnimes(url) {
    (async () => {
      const browser = await puppeteer.launch(
        {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized',
          ],
          headless: true
          //executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
        });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 })
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
      const weekDays = await page.$$('div.datas > ul > li > a');
      let idxAnimeDetails = 0
      await weekDays[0].click()
      const animesSegunda = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('1')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesSegunda.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesSegunda[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesSegunda[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesSegunda[idxAnimeDetails].statusAtual = resultDetails[1];
          animesSegunda[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesSegunda[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesSegunda[idxAnimeDetails].estudio = resultDetails[4];
          animesSegunda[idxAnimeDetails].generos = resultDetails[5];
          animesSegunda[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[1].click()
      const animesTerca = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('2')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesTerca.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesTerca[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesTerca[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesTerca[idxAnimeDetails].statusAtual = resultDetails[1];
          animesTerca[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesTerca[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesTerca[idxAnimeDetails].estudio = resultDetails[4];
          animesTerca[idxAnimeDetails].generos = resultDetails[5];
          animesTerca[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[2].click()
      const animesQuarta = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('3')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesQuarta.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesQuarta[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesQuarta[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesQuarta[idxAnimeDetails].statusAtual = resultDetails[1];
          animesQuarta[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesQuarta[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesQuarta[idxAnimeDetails].estudio = resultDetails[4];
          animesQuarta[idxAnimeDetails].generos = resultDetails[5];
          animesQuarta[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[3].click()
      const animesQuinta = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('4')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesQuinta.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesQuinta[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesQuinta[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesQuinta[idxAnimeDetails].statusAtual = resultDetails[1];
          animesQuinta[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesQuinta[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesQuinta[idxAnimeDetails].estudio = resultDetails[4];
          animesQuinta[idxAnimeDetails].generos = resultDetails[5];
          animesQuinta[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[4].click()
      const animesSexta = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('5')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesSexta.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesSexta[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesSexta[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesSexta[idxAnimeDetails].statusAtual = resultDetails[1];
          animesSexta[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesSexta[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesSexta[idxAnimeDetails].estudio = resultDetails[4];
          animesSexta[idxAnimeDetails].generos = resultDetails[5];
          animesSexta[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[5].click()
      const animesSabado = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('6')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesSabado.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesSabado[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesSabado[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesSabado[idxAnimeDetails].statusAtual = resultDetails[1];
          animesSabado[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesSabado[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesSabado[idxAnimeDetails].estudio = resultDetails[4];
          animesSabado[idxAnimeDetails].generos = resultDetails[5];
          animesSabado[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      await weekDays[6].click()
      const animesDomingo = await page.evaluate(() => {
        function add12(hour) {
          switch (hour.split(':')[0]) {
            case '01':
              return '13'
            case '02':
              return '14'
            case '03':
              return '15'
            case '04':
              return '16'
            case '05':
              return '17'
            case '06':
              return '18'
            case '07':
              return '19'
            case '08':
              return '20'
            case '09':
              return '21'
            case '10':
              return '22'
            case '11':
              return '23'
            case '12':
              return '00'
            case '13':
              return '01'
            case '14':
              return '02'
            case '15':
              return '03'
            case '16':
              return '04'
            case '17':
              return '05'
            case '18':
              return '06'
            case '19':
              return '07'
            case '20':
              return '08'
            case '21':
              return '09'
            case '22':
              return '10'
            case '23':
              return '11'
            case '00':
              return '12'
            default:
              return 'invalid';
          }
        }
        let animes = [];
        let animesUrl = [];
        let animesNames = [];
        let animesDaysOTW = [];
        let animesImgs = [];
        let animesHoraBR = [];
        let animesHoraJP = [];
        let animesReleaseDate = [];
        //get all URL from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a')
          .forEach(animeUrl => {
            animesUrl.push(animeUrl.getAttribute('href'))
            //get all dayOFW
            animesDaysOTW.push('0')
            //get all releaseDate
            animesReleaseDate.push('??')
          })
        //get all names frm current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > figcaption')
          .forEach(animeName => animesNames.push(animeName.innerHTML.trim()))
        //get all Img from current day
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > figure > img')
          .forEach(animeImg => animesImgs.push(animeImg.getAttribute('data-src')))
        //get all horaBR
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeBR => animesHoraBR.push(animeBR.innerHTML))
        //get all horaJP
        document.querySelectorAll('div.__panel.__slide.y-hidden > div.anime-entry-container > a > article > header > span')
          .forEach(animeJP => {
            let hora = animeJP.innerHTML;
            animesHoraJP.push(add12(hora) + ':' + hora.split(':')[1])
          })

        for (let i = 0; i < animesUrl.length; i++) {
          animes[i] = {
            url: 'https://www.animestc.com' + animesUrl[i], name: animesNames[i], dayOTW: animesDaysOTW[i], img: animesImgs[i],
            transmiBR: animesHoraBR[i], transmiJP: animesHoraJP[i], animeReleaseDate: animesReleaseDate[i]
          };
        }
        return animes
      })
      while (idxAnimeDetails < animesDomingo.length) {
        try {
          let paginaDetails = await browser.newPage();
          await paginaDetails.goto(animesDomingo[idxAnimeDetails].url, { waitUntil: 'networkidle2', timeout: 0 });
          const resultDetails = await paginaDetails.evaluate(() => {
            let animeDetails = [];
            let classificacao = document.querySelector('div.tooltip-container > article > aside > figure.centering-container > figcaption').innerText
            document.querySelectorAll('div.series-data-entry').forEach(content => {
              (animeDetails.length == 0) ?
                animeDetails.push(classificacao, content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
                :
                animeDetails.push(content.textContent.split(/[a-z]: /)[1].replace(/(\r\n|\n|\r)/gm, '').trim())
            })
            return animeDetails;
          })
          //console.log(resultDetails);
          animesDomingo[idxAnimeDetails].classificacao = resultDetails[0].toLowerCase().includes("livre")
            ? "L"
            : resultDetails[0].includes("18")
              ? "18"
              : resultDetails[0].split(" ")[0];
          animesDomingo[idxAnimeDetails].statusAtual = resultDetails[1];
          animesDomingo[idxAnimeDetails].numeroEpisodios = resultDetails[2];
          animesDomingo[idxAnimeDetails].anoLancamento = resultDetails[3];
          animesDomingo[idxAnimeDetails].estudio = resultDetails[4];
          animesDomingo[idxAnimeDetails].generos = resultDetails[5];
          animesDomingo[idxAnimeDetails].sinopse = resultDetails[6];
          await paginaDetails.close();
          idxAnimeDetails++;
        } catch (error) {
          console.log(error);
        }
      }
      idxAnimeDetails = 0;
      let animeList = [];
      let animeListIdx = 0;
      while (animeListIdx < animesSegunda.length) {
        animeList.push(animesSegunda[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesTerca.length) {
        animeList.push(animesTerca[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesQuarta.length) {
        animeList.push(animesQuarta[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesQuinta.length) {
        animeList.push(animesQuinta[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesSexta.length) {
        animeList.push(animesSexta[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesSabado.length) {
        animeList.push(animesSabado[animeListIdx])
        animeListIdx++
      }
      animeListIdx = 0
      while (animeListIdx < animesDomingo.length) {
        animeList.push(animesDomingo[animeListIdx])
        animeListIdx++
      }
      console.log("===========animesList===========");
      console.log(animeList);
      console.log("===========animesList===========");
      addAnimesToDB({ _id: "animes:list", animes: animeList }, myDB)
      await browser.close();
    })()
  };

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
  if (req.headers['secret-one'] == 'platypus') {
    getAnimes(URL)
    res.send({ action: 'generating anime list puppeteer', status: 'success' })
  } else {
    res.send({ action: 'generate list puppeteer', status: 'failed' })
  }
});

server.get('/api/animeList', (req, res) => {
  res.sendFile(__dirname + '/assets/json/animeList.json');
});

server.get('*', (req, res) => {
  res.sendFile(__dirname + '/404.html', 404);
});

server.listen(process.env.PORT, () => console.log("listening on port ", process.env.PORT));

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
