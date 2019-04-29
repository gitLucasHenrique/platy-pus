const teste = require('axios');

//const URL = 'https://things.ubidots.com/api/v1.6/devices/Alarme1/gas1';
//const URL = 'https://things.ubidots.com/api/v1.6/variables/5cba9ee859163624a9572a64/values';
//const URL = 'https://platy-pus.herokuapp.com/api/animeList';
//
const URL = 'https://www.animestc.com/'

teste.get(URL)
    .then(function (response){
    return response.data;
    })
    .catch(function (error){
    return error
});
