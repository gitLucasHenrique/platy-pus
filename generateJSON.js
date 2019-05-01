const teste = require('axios');
const cheerio = require('cheerio');
const URL = 'https://www.animestc.com/'
const fs = require('fs');

teste.get(URL, {
    headers: { 'platypus': 'pwd-platypus' }
})
    .then(function (response){
        let strAnimeList = '{\"animes\": ' + JSON.stringify(workData(response.data)) + '}';
        fs.writeFile('./assets/json/animeList.json', strAnimeList, function(err){
            if(err){
                console.log('failed to write file due: ', err);
            }
        });
        //console.log(workData(response.data));
    })
    .catch(function (error){
        console.log(error);
});

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