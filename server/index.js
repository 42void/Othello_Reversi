require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');
const uniqid = require('uniqid');

const app = express();
app.use(cors());
app.use(express.static(`${__dirname}/../dist`));
const http = require('http').createServer(app);
const io = require('socket.io')(http, { origins: '*:*' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const open = require('open');

(async () => {
  // Opens the url in the default browser
  await open('http://localhost:9000');
})();

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
  grid TEXT,
  gameID TEXT
);`);

app.post('/newGame', (req, res) => {
  const gameID = uniqid();
  const { grid, currentPlayer } = req.body;
  db.run(`INSERT INTO ${DB_TABLE} VALUES(?,?,?,?)`,
    [null, currentPlayer, JSON.stringify(grid), gameID], (err) => {
      if (err) {
        console.log(err.message);
      }
      res.send({ gameID });
    });
});

app.post('/saveGame', (req, res) => {
  const {
    grid, currentPlayer, gameID, msg,
  } = req.body;
  db.run(`UPDATE ${DB_TABLE} SET currentPlayer=${currentPlayer}, grid="${JSON.stringify(grid)}" WHERE gameID = "${gameID}"`, function (err) {
    if (err) {
      console.log(err.message);
    }
    if (this.changes) {
      res.send('A row has been updated');
      io.emit('game updated', {
        grid, currentPlayer, gameID, msg,
      });
    } else {
      res.send('GameID not found');
    }
  });
});

app.get('/getGame', (req, res) => {
  const { gameID } = req.query;
  db.each(`SELECT * from ${DB_TABLE} WHERE gameID = "${gameID}"`, (err, row) => {
    if (err) {
      console.log(err.message);
    }
    const { grid, currentPlayer } = row;
    res.send({ grid: JSON.parse(grid), currentPlayer });
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 9000;
http.listen(PORT, (err) => {
  if (err) console.error(err);
  else console.log(`Listening to port: ${PORT}`);
});
