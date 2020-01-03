import React, { Component } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import Piece from './components/Piece';
import './style.scss';
import blackPiece from '../p_black.png';
import whitePiece from '../p_white.png';

const socket = socketIOClient('//localhost:9000');

export const directions = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

const black = 1;
const white = 2;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      player: black,
      msg: '',
    };
  }

  componentDidMount() {
    const gameID = this.getGameIDfromURL();
    if (gameID !== null) this.getGame();
    else this.newGame();
    document.addEventListener('keydown', (e) => {
      // play a random valid move when press R key
      if (e.key.toString() === 'r') this.playRandomMove();
      // new game when press N key
      if (e.key.toString() === 'n') window.location.href = '.';
    });
    socket.on('game updated', (game) => {
      this.updateGameViaSocket(game);
    });
  }

  getGameIDfromURL = () => {
    const gameID = window.location.hash.slice(1);
    if (gameID === '') return null;
    return gameID;
  }

  getGame = () => {
    const gameID = this.getGameIDfromURL();
    axios.get('//localhost:9000/getGame', { params: { gameID } })
      .then((response) => {
        const { currentPlayer, grid } = response.data;
        this.setState({ player: currentPlayer, grid });
      })
      .catch((error) => {
        console.error('getGame', { error });
      });
  }

  newGame = () => {
    if (this.getGameIDfromURL()) console.log('Already a gameID but creating a new game');
    const { player, grid, msg } = this.state;
    axios.post('//localhost:9000/newGame', {
      currentPlayer: player,
      grid,
      msg,
    })
      .then((response) => {
        const { gameID } = response.data;
        if (gameID) window.location.hash = gameID;
      })
      .catch((error) => {
        console.error('newGame', { error });
      });
  }

  playRandomMove = () => {
    const { grid, player } = this.state;
    const moves = this.possibleMoves(grid, player);
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    if (randomMove) this.reverseAndAddPiecesIfValid(randomMove);
  }

  updateGameViaSocket = (game) => {
    const {
      grid, currentPlayer, gameID, msg,
    } = game;
    if (gameID === this.getGameIDfromURL()) {
      this.setState({ grid, msg, player: currentPlayer });
    }
  }

  createGrid = () => {
    const { grid, player } = this.state;
    const gridDisplay = [];
    grid.forEach((line, i_) => {
      const i = i_;
      gridDisplay.push(<div key={i} style={{ display: 'flex' }}>{this.createLine(line, i, grid, player)}</div>);
    });
    return gridDisplay;
  }

  createLine = (data, i_, grid, player) => {
    const i = i_;
    const line = [];
    data.forEach((square, j) => {
      const coord = [i, j];
      const playable = this.toBeChangedAllDirections(grid, player, coord).length > 0;
      if (playable) {
        line.push(
          <button
            type="button"
            key={coord}
            onClick={() => { this.reverseAndAddPiecesIfValid(coord); }}
            className="square"
          >
            {square !== 0 ? <Piece color={square} /> : <div className="possibleMove" />}
          </button>,
        );
      } else {
        line.push(
          <button
            type="button"
            key={coord}
            className="square"
          >
            {square !== 0 ? <Piece color={square} /> : ''}
          </button>,
        );
      }
    });
    return line;
  }

  // pieces to be colored to player's color
  // if they play at given position in all directions
  toBeChangedAllDirections = (grid, player, position) => {
    const [i, j] = position;
    // already something here? forbidden move, we return []
    if (grid[i][j] !== 0) return [];
    // pieces to be turned over in all directions
    const toChange = [];
    for (let index = 0; index < directions.length; index += 1) {
      const dir = directions[index];
      toChange.push(...this.toBeChangedInThisSpecificDirection(grid, player, position, dir));
    }
    if (toChange.length === 0) return [];
    // if there is at least one to be turned over, we add the position itself
    toChange.push(position);
    return toChange;
  }

  // pieces to be colored to player's color
  // if they play at given position in given direction
  toBeChangedInThisSpecificDirection = (grid, player, position, direction) => {
    const opponent = this.getOpponent(player);
    const [i, j] = position;
    const [di, dj] = direction;
    // avoid special cases when reaching outside the grid
    const pieceAt = (a, b) => (this.inGrid(a, b) ? grid[a][b] : -1);
    const toChange = [];
    // advance in given direction while it is the opponent's color
    let distance = 1;
    while (pieceAt(i + di * distance, j + dj * distance) === opponent) {
      toChange.push([i + di * distance, j + dj * distance]);
      distance += 1;
    }
    // and if we reach player's color, we return what we have seen
    if (pieceAt(i + di * distance, j + dj * distance) === player) {
      return toChange;
    }
    // otherwise, that was a bad direction
    return [];
  }

  inGrid = (line, column) => line >= 0 && line < 8 && column >= 0 && column < 8;

  getOpponent = (player) => (player === white ? black : white)

  victoryMessage = (grid) => {
    const { scoreWhite, scoreBlack } = this.getScore(grid);
    let winner = 'Draw.';
    if (scoreWhite > scoreBlack) winner = 'White wins!';
    if (scoreWhite < scoreBlack) winner = 'Black wins!';
    return `End of game. ${winner}`;
  }

  getScore = (grid) => {
    let scoreBlack = 0;
    let scoreWhite = 0;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        if (grid[y][x] === black) scoreBlack += 1;
        if (grid[y][x] === white) scoreWhite += 1;
      }
    }
    return { scoreWhite, scoreBlack };
  }


  reverseAndAddPiecesIfValid = (coord) => {
    const { grid } = this.state;
    let { player } = this.state;
    let msg = '';
    const toChange = this.toBeChangedAllDirections(grid, player, coord);
    if (toChange.length > 0) {
      // Play the given move
      toChange.forEach(([y, x]) => { grid[y][x] = player; });
      player = this.getOpponent(player);
      // Check that the opponent can play
      if (!this.canPlay(grid, player)) {
        msg = `${this.playerName(player)} cannot play, skipping turn...`;
        player = this.getOpponent(player);
      }
      // Check victory
      if (this.gameEnded(grid)) msg = this.victoryMessage(grid);
      // Save new state
      this.setState({ grid, player, msg }, () => {
        this.saveGame();
      });
    }
  }

  saveGame = () => {
    const gameID = this.getGameIDfromURL();
    if (gameID === '') console.warn('Tried to save game with no gameID');
    const { player, grid, msg } = this.state;
    axios.post('//localhost:9000/saveGame', {
      currentPlayer: player,
      grid,
      gameID,
      msg,
    })
      .then((response) => {
        console.log('saveGame', { response });
      })
      .catch((error) => {
        console.error('saveGame', { error });
      });
  }


  canPlay = (grid, player) => this.possibleMoves(grid, player).length > 0

  gameEnded = (grid) => !this.canPlay(grid, black) && !this.canPlay(grid, white);

  // returns all the possible moves from given player
  possibleMoves = (grid, player) => {
    const moves = [];
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        if (this.toBeChangedAllDirections(grid, player, [y, x]).length > 0) {
          moves.push([y, x]);
        }
      }
    }
    return moves;
  }

  playerName = (num) => (num === 1 ? 'BLACK' : 'WHITE')

  render() {
    const { msg, grid, player } = this.state;
    const { scoreWhite, scoreBlack } = this.getScore(grid);
    return (
      <div>
        <h1>Othello</h1>
        <p><a href=".">Start a new game</a></p>
        <div style={{ display: 'flex' }}>
          <span>
Current
            {' '}
player:
            {' '}
            {this.playerName(player)}
          </span>
          <span style={{ marginLeft: '.5rem' }}>
            {this.playerName(player) === 'BLACK' ? <img alt="black piece" height="20px" width="20px" src={blackPiece} />
              : <img alt="black piece" height="20px" width="20px" src={whitePiece} />}
          </span>
        </div>
        {this.createGrid()}
        <p>
          Black:
          {' '}
          {scoreBlack}
          {' '}
          White:
          {' '}
          {scoreWhite}
        </p>
        <p className="message">{msg}</p>
      </div>
    );
  }
}
