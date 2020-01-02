require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
// app.use(express.static(`${__dirname}/../dist`));
const http = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = process.env.DB_FILE || 'othello.db';
const DB_TABLE = process.env.DB_TABLE || 'games';

const db = new sqlite3.Database(path.resolve(__dirname, `./${DB_FILE}`), (err) => {
  if (err) console.log(err.message);
  else console.log('Connected to the Othello database');
});

db.run(`CREATE TABLE IF NOT EXISTS ${DB_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currentPlayer INTEGER,
  grid TEXT
);`);

app.post('/saveGame', (req, res) => {
  const { grid, currentPlayer } = req.body;
  db.run(`INSERT INTO ${DB_TABLE} VALUES(?,?,?)`,
    [null, currentPlayer, JSON.stringify(grid)], (err) => {
      if (err) {
        console.log(err.message);
      }
      if (this.changes) {
        res.send('A row has been updated');
      }
    });
});

const PORT = process.env.PORT || 9000;
http.listen(PORT, (err) => {
  if (err) console.error(err);
  else console.log(`Listening to port: ${PORT}`);
});
