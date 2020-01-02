import React, { Component } from 'react';
import Piece from './components/Piece';
import './style.scss';

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
    };
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

  reverseAndAddPiecesIfValid = (coord) => {
    const { grid } = this.state;
    let { player } = this.state;
    const toChange = this.toBeChangedAllDirections(grid, player, coord);
    if (toChange.length > 0) {
      // Play the given move
      toChange.forEach(([y, x]) => { grid[y][x] = player; });
      player = this.getOpponent(player);
      // Save new state
      this.setState({ grid, player });
    }
  }

  canPlay = (grid, player) => this.possibleMoves(grid, player).length > 0

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


  render() {
    return (
      <div>
        <h1>Othello</h1>
        {this.createGrid()}
      </div>
    );
  }
}
