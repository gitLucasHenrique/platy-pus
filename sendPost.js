const teste = require('axios');
const URL = 'https://fcm.googleapis.com/fcm/send';

teste.post(URL, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'key=ftWO_hosz4A:APA91bFD6AH_KKJl0oj8BOYwI5Dw6uo-6DQGTEe8mWCteqN3odBZTArYvfBKE5isC2xbe79IdK-mbqp_1WS9i6YASRlH3Ijc25HqBq0g8RCN4q-GhzRxvVoWoi7TT7nzLlciDXkSjAzj'},
    body: {
        "notification": {
        "title": "Teste turma",
        "body": "Teste Firebase"
    },
    "to" : "ftWO_hosz4A:APA91bFD6AH_KKJl0oj8BOYwI5Dw6uo-6DQGTEe8mWCteqN3odBZTArYvfBKE5isC2xbe79IdK-mbqp_1WS9i6YASRlH3Ijc25HqBq0g8RCN4q-GhzRxvVoWoi7TT7nzLlciDXkSjAzj"
}})
    .then(function (response){
    console.log(response.data);
    })
    .catch(function (error){
    return error
});
