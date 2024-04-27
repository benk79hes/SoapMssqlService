const soap = require('soap');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


function getTransferResponse(row, amount) {
  let quota = Math.floor(amount * 10);
  return {
    uid: row.uid,
    username: row.username,
    cardId: row.cardId,
    quota: quota
  };
}
let db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
    return console.error(err.message);
  }
  console.log('Connecté à la base de données SQLite en mémoire.');
});

const service = {
  UserService: {
    UserServicePort: {
      transferAmountByUsername: function(args) {
        const username = args.username;
        const amount = args.amount;

        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE username = ?";
            db.get(sql, [username], function(err, row) {
              if (err) {
                console.error(err.message);
                // Rejetez la promesse avec une erreur
                reject(err);
              } else {
                console.log("Utilisateur trouvé avec succès");

                resolve(getTransferResponse(row, amount));
              }
            });
          });
        // Implémentez la logique pour transférer le montant et retourner le quota avec uid
      },
      transferAmountByUid: function(args) {
        const uid = args.uid;
        const amount = args.amount;

        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE uid = ?";
            db.get(sql, [uid], function(err, row) {
              if (err) {
                console.error(err.message);
                // Rejetez la promesse avec une erreur
                reject(err);
              } else {
                console.log("Utilisateur trouvé avec succès");

                resolve(getTransferResponse(row, amount));
              }
            });
          });
        // Implémentez la logique pour transférer le montant et retourner le quota avec uid
        // return { quota: 0 };
      },
      createUser: function(args, callback) {
        console.log("createUser called");
        const uid = args.uid;
        const username = args.username;
        const cardId = args.cardId;

        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO users (uid, username, cardId) VALUES (?, ?, ?)";
            db.run(sql, [uid, username, cardId], function(err, result) {
              if (err) {
                console.error(err.message);
                // Rejetez la promesse avec une erreur
                reject({ result: "Error" });
              } else {
                console.log("Utilisateur créé avec succès");
                // Résolvez la promesse avec le résultat
                resolve({ result: "Success" });
              }
            });
          });
      }
    }
  }
};

const xml = require('fs').readFileSync('./service.wsdl', 'utf8');

const app = express();


app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
// app.use(bodyParser.text({type: function(){return true;}, limit: '5mb'}));


/* app.use(function(req, res, next) {
    // console.log('Request:', req.headers);
    console.log('Body:', req.body);
    res.send('')
  next();
}); */
app.listen(process.env.PORT || 8080, function(){
  soap.listen(app, '/wsdl', service, xml, function(){
    console.log('server initialized with');
  });
});