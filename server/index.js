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
const GAMES_TABLE = process.env.GAMES_TABLE || 'games';

const db = new sqlite3.Database(path.resolve(__dirname, `./${DB_FILE}`), (err) => {
  if (err) console.log(err.message);
  else console.log('Connected to the Othello database');
});

db.run(`CREATE TABLE IF NOT EXISTS ${GAMES_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currentPlayer INTEGER,
  grid TEXT,
  gameID TEXT,
  lastChanged INTEGER
);`);

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

// get the games list from the database and returns it with the grid JSON-parsed for each game
function getGamesList(callback) {
  db.all(`SELECT * from ${GAMES_TABLE}`, (err, rows) => {
    if (err) {
      console.log(err.message);
    }
    callback(rows.map(
      ({
        currentPlayer, grid, gameID, lastChanged,
      }) => ({
        currentPlayer, grid: JSON.parse(grid), gameID, lastChanged,
      }),
    ));
  });
}

app.get('/getGamesList', (req, res) => {
  getGamesList((gamesList) => res.send(gamesList));
});

app.post('/newGame', (req, res) => {
  const gameID = uniqid();
  const { grid, currentPlayer } = req.body;
  db.run(`INSERT INTO ${GAMES_TABLE} VALUES(?,?,?,?,?)`,
    [null, currentPlayer, JSON.stringify(grid), gameID, now()], (err) => {
      if (err) {
        console.log(err.message);
      }
      getGamesList((gamesList) => io.emit('gameslist updated', gamesList));
      res.send({ gameID });
    });
});

app.post('/saveGame', (req, res) => {
  const {
    grid, currentPlayer, gameID, msg,
  } = req.body;
  db.run(`UPDATE ${GAMES_TABLE} SET currentPlayer=${currentPlayer}, grid="${JSON.stringify(grid)}", lastChanged="${now()}" WHERE gameID = "${gameID}"`, function (err) {
    if (err) {
      console.log(err.message);
    }
    if (this.changes) {
      getGamesList((gamesList) => io.emit('gameslist updated', gamesList));
      io.emit('game updated', {
        grid, currentPlayer, gameID, msg,
      });
      res.send('A row has been updated');
    } else {
      res.send('GameID not found');
    }
  });
});

app.get('/getGame', (req, res) => {
  const { gameID } = req.query;
  db.each(`SELECT * from ${GAMES_TABLE} WHERE gameID = "${gameID}"`, (err, row) => {
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
