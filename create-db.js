const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('db.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connecté à la base de données SQLite en mémoire.');
});

db.run(`CREATE TABLE users(
    uid INTEGER PRIMARY KEY,
    username TEXT,
    cardId INTEGER
  )`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Table users créée.');
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Fermeture de la connexion à la base de données SQLite.');
  });