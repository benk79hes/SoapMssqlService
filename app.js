const soap = require('soap');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


function getTransferResponse(row, amount) {
  let quota = Math.floor(amount * 10);

  console.log(`Transfert de ${amount}CHF pour ${row.username} (uid: ${row.uid})`);
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
  console.log('Connecté à la base de données SQLite, fichier db.sqlite');
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
              } else if(row === undefined) {
                reject(new Error(`Utilisateur avec username ${username} non trouvé`));
              } else {
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
              } else if(row === undefined) {
                reject(new Error(`Utilisateur avec uid ${uid} non trouvé`));
              } else {
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
                console.log(`Utilisateur créé: ${username} (uid: ${uid}, cardId: ${cardId})`);
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

app.listen(process.env.PORT || 8080, function(){
  soap.listen(app, '/wsdl', service, xml, function(){
    console.log('server listening on port 8080');
  });
});