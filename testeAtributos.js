const cheerio = require('cheerio');
const fetch = require('node-fetch');

function workData(data){
    let $ = cheerio.load(data);
    let animeList = [];
    let animeURL = [];

    $('.atualizacoes-content').find('.transmissao-container').each(function(i, value){
        animeURL.push($('a', this).attr('href'));
        //console.log($('a', this).attr('href'))
    });

    for ( i = 0; i < $('.atualizacoes-content').find('.transmissao-container').length; i++){
        animeList[i] = { animeURL : animeURL[i] };
    }
    return animeList;
}

function getAnimeDetails(data){
    let $ = cheerio.load(data);
    let anime;
    let animeDetails = [];
    anime = $('.pag-anime').find('.pag-anime-dados-direita').find('ul').first().text();
    animeDetails = anime.toString().trim().replace('\n\n','\n').split('\n');
    //animeDetails.push(anime)
    console.log(animeDetails);
}

fetch("https://www.animestc.com/")
    .then(res => res.text())
    .then((text) => {
        //console.log(JSON.stringify(workData(text), null, 2));
        //workData(text);
    });

fetch("https://www.animestc.com/animes/boruto-naruto-next-generations-download-legendado-923845/")
    .then(res => res.text())
    .then((text) =>{
        getAnimeDetails(text);
    });