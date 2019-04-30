const teste = require('axios');
const cheerio = require('cheerio');

//const URL = 'https://things.ubidots.com/api/v1.6/devices/Alarme1/gas1';
//const URL = 'https://things.ubidots.com/api/v1.6/variables/5cba9ee859163624a9572a64/values';
//const URL = 'https://platy-pus.herokuapp.com/api/animeList';
//
const URL = 'https://www.animestc.com/'


teste.get(URL, {
    headers: { 'platypus': 'pwd-platypus' }
})
    .then(function (response){
        workData(response.data);
    })
    .catch(function (error){
        console.log(error);
});


function workData(data){
    const $ = cheerio.load(data);
    $('.atualizacoes-content').each((i, el) => {
        const animeTitle = $(el)
        .find('.transmissao-container')
        .find('.anime-transmissao-container')
        .find('.anime-transmissao-nome')
        .text()
        
        const animeImage = $(el)
        .find('.transmissao-container')
        .find('.anime-transmissao-container')
        .find('img')
        .attr('src');
        console.log(i, animeTitle, animeImage);
    });
}