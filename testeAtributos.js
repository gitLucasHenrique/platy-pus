const cheerio = require('cheerio');
const fetch = require('node-fetch');

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

    //console.log(animeHoraJP);
    for ( i = 0; i < $('.atualizacoes-content').find('.transmissao-container').length; i++){
        animeList[i] = { name : animeNames[i], dayOTW : animeDaysOTW[i], img : animeImgs[i],
            transmiBR : animeHoraBR[i], transmiJP : animeHoraJP[i], animeReleaseDate : animeReleaseDate[i] };
    }
    return animeList;
}

fetch("https://www.animestc.com/")
    .then(res => res.text())
    .then((text) => {
        console.log(JSON.stringify(workData(text), null, 2));
        //workData(text);
    })