const Cloudant = require('@cloudant/cloudant');
const fetch = require('node-fetch');
require('dotenv').config();

var doc = {"_id":"animes:list", "animes": [{"name":"Kochouki: Wakaki Nobunaga","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/101157l-295x420.jpg"},{"name":"Katsute Kami Datta Kemono-tachi e","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/101230l-298x420.jpg"},{"name":"Cop Craft","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/101178l-297x420.jpg"},{"name":"Ore wo Suki nano wa Omae dake ka yo","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/100974l-256x420.jpg"},{"name":"Starmyu 3 Temporada","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/99834l-297x420.jpg"},{"name":"Kawaikereba Hentai demo Suki ni Natte Kuremasu ka?","dayOTW":"1","img":"https://www.animestc.com/wp-content/uploads/2019/07/Kawaikereba-Hentai-demo-Suki-ni-Natte-Kuremasu-ka-300x381.jpg"},{"name":"Diamond no Ace: Act II","dayOTW":"2","img":"https://www.animestc.com/wp-content/uploads/2019/04/99220l-292x420.jpg"},{"name":"Black Clover","dayOTW":"2","img":"https://www.animestc.com/wp-content/uploads/2017/10/045567fe243109fd4af39bfc4230e9291559150972_full-280x420.jpg"},{"name":"Tejina-senpai","dayOTW":"2","img":"https://www.animestc.com/wp-content/uploads/2019/07/99785l-296x420.jpg"},{"name":"Sounan Desu ka?","dayOTW":"2","img":"https://www.animestc.com/wp-content/uploads/2019/07/101216l-295x420.jpg"},{"name":"Kono Yo no Hate de Koi wo Utau Shoujo YU-NO","dayOTW":"2","img":"https://www.animestc.com/wp-content/uploads/2018/09/89784l-297x420.jpg"},{"name":"Yu-Gi-Oh! VRAINS","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2017/06/73548d4b1a4fe23f3710fb85f240c5b01495098296_full-280x420.jpg"},{"name":"Isekai Cheat Magician","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2019/07/101232l-296x420.jpg"},{"name":"Carole & Tuesday","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2019/04/96132l-298x420.jpg"},{"name":"Kanata no Astra","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2019/07/100976l-297x420.jpg"},{"name":"Dumbbell Nan Kilo Moteru?","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2019/07/98306l-297x420.jpg"},{"name":"Maou-sama, Retry!","dayOTW":"3","img":"https://www.animestc.com/wp-content/uploads/2019/07/100722l-295x420.jpg"},{"name":"Karakuri Circus","dayOTW":"4","img":"https://www.animestc.com/wp-content/uploads/2018/09/93384l-289x420.jpg"},{"name":"Uchi no Ko no Tame naraba, Ore wa Moshikashitara Maou mo Taoseru kamo Shirenai.","dayOTW":"4","img":"https://www.animestc.com/wp-content/uploads/2019/07/101203l-291x420.jpg"},{"name":"Machikado Mazoku","dayOTW":"4","img":"https://www.animestc.com/wp-content/uploads/2019/07/101109l-258x420.jpg"},{"name":"Given","dayOTW":"4","img":"https://www.animestc.com/wp-content/uploads/2019/07/101517l-294x420.jpg"},{"name":"Toaru Kagaku no Accelerator","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/99995l-296x420.jpg"},{"name":"Joshikousei no Mudazukai","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/99966l-297x420.jpg"},{"name":"Dr. Stone","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/Dr.STONE_Key_Visual_1-297x420.jpg"},{"name":"Granbelm","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/101330l-297x420.jpg"},{"name":"Tsuujou Kougeki ga Zentai Kougeki de Ni-kai Kougeki no Okaasan wa Suki Desu ka?","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/100995l-297x420.jpg"},{"name":"Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka II","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/101326l-297x420.jpg"},{"name":"JoJo no Kimyou na Bouken: Ougon no Kaze","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2018/09/04b29833ccaaf2ee6bda1d08f2f02ecf1539039197_full-280x420.jpg"},{"name":"Fruits Basket (2019)","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/04/96524l-298x420.jpg"},{"name":"Enen no Shouboutai","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/100716l-300x420.jpg"},{"name":"Araburu Kisetsu no Otome-domo yo","dayOTW":"5","img":"https://www.animestc.com/wp-content/uploads/2019/07/101166l-295x420.jpg"},{"name":"Lord El-Melloi II Sei no Jikenbo: Rail Zeppelin Grace Note","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2019/07/101037l-297x420.jpg"},{"name":"Senki Zesshou Symphogear XV","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2019/07/101110l-298x420.jpg"},{"name":"Kimetsu no Yaiba","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2019/04/99748l-294x420.jpg"},{"name":"Fairy Tail: Final Series (2018)","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2018/09/93863l-298x420.jpg"},{"name":"Gegege no Kitarou (2018)","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2018/04/24269b54d7f7d67f03c99fdd8c405ddd1522538962_full-297x420.jpg"},{"name":"One Piece","dayOTW":"6","img":"https://www.animestc.com/wp-content/uploads/2015/03/91552bd85d936ae980f9a91aab10a96b1501895909_full-280x420.jpg"},{"name":"Boruto – Naruto Next Generations","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2017/03/9adde4f9cc8b426d323003388462d70b1551299649_full-280x420.jpg"},{"name":"Karakai Jouzu no Takagi-san 2° Temporada","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/101180l-296x420.jpg"},{"name":"Try Knights","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/100028l-298x420.jpg"},{"name":"Vinland Saga","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/99011l-298x420.jpg"},{"name":"Nakanohito Genome","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/101516l-300x420.jpg"},{"name":"BEM","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/99941l-300x420.jpg"},{"name":"Ensemble Stars!","dayOTW":"7","img":"https://www.animestc.com/wp-content/uploads/2019/07/92451l-298x420.jpg"}]}

var dbCred = 
{
"apikey": "a1GYXUhbjvE9momewXFIcMdXSPUMvPRDBznc1IT--JTR",
"host": "052d57db-360e-4684-975e-a14f779f9f32-bluemix.cloudantnosqldb.appdomain.cloud",
"iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:cloudantnosqldb:us-south:a/6c12439f794449f08949b60b0882756b:31f288fd-95e0-465b-bd0e-061da3e90304::",
"iam_apikey_name": "auto-generated-apikey-d692a68d-a371-41e2-ad38-a47d1e5908d1",
"iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
"iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/6c12439f794449f08949b60b0882756b::serviceid:ServiceId-46b0b60f-41ac-4b38-8cef-61ac2ec994d8",
"url": "https://052d57db-360e-4684-975e-a14f779f9f32-bluemix.cloudantnosqldb.appdomain.cloud",
"username": "052d57db-360e-4684-975e-a14f779f9f32-bluemix"
}

var cloudant = new Cloudant({
  account: dbCred.username,
  plugins: {
    iamauth: {
      iamApiKey: dbCred.apikey
    }
  }
});

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

getDoc('animes', 'animes:list');
//listDB();
//createDB("animes");
//insertDoc('animes',doc);