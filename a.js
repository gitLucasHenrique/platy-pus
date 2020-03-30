
const Cloudant = require('@cloudant/cloudant');
let cloudant = new Cloudant({
    account: "052d57db-360e-4684-975e-a14f779f9f32-bluemix",
    plugins: {
        iamauth: {
            iamApiKey: "a1GYXUhbjvE9momewXFIcMdXSPUMvPRDBznc1IT--JTR"
        }
    }
});
let id = "c5kkux_asVQ:APA91bGwL9BnvrUNrWMLAZzPpyqtS4Z5jltwz_0VJ6hA1HRKkbMDLedTUerTt2WqqpGsNCe01VAE9pHiJbfCeX3MLJjWW5S-9niE3kPPb2-5MVgxU1sPb-fnSVZ-Df8WBsLPiMNwePW6";
let animeDB = cloudant.db.use("users");
let animeName = "Tamayomi";
let queryUser = {
    "selector": {
        "_id": {
            "$eq": id
        }
    }
}

animeDB.get(id, (err, data) => {
    if (err) {
        console.log(err);
    } else {
        data.animes.forEach(element => {
            if (element.name == animeName) console.log("encontrado")
        });
    }
})