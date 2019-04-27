const http = require('http');
const fs = require('fs');
const jsonFile = require('./assets/json/teste');

const server = http.createServer(function(req,res){
    console.log('requested' + req.url);
    if(req.url === '/' || req.url === '/home'|| req.url === '/index'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + '/index.html').pipe(res);
    }if(req.url === '/api/animeList'){
        if(req.headers['platypus'] === 'pwd-platypus'){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(jsonFile));
        }else{
            res.writeHead(403, {'Content-Type': 'text/html'});
            fs.createReadStream(__dirname + '/403.html').pipe(res);
        }
    }else{
        res.writeHead(404, {'Content-Type': 'text/html'});
        fs.createReadStream(__dirname + '/404.html').pipe(res);
    }
});

server.listen(443,"https://platy-pus.herokuapp.com/");