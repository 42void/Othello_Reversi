import React, { Component } from 'react';
import Piece from './components/Piece';
import './style.scss';

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
    };
  }

  createGrid = () => {
    const { grid } = this.state;
    const gridDisplay = [];
    grid.forEach((line, i_) => {
      const i = i_;
      gridDisplay.push(<div key={i} style={{ display: 'flex' }}>{this.createLine(line, i)}</div>);
    });
    return gridDisplay;
  }

  createLine = (data, i_) => {
    const i = i_;
    const line = [];
    data.forEach((square, j) => {
      const coord = [i, j];
      line.push(
        <button
          type="button"
          key={coord}
          className="square"
        >
          {square !== 0 ? <Piece color={square} /> : ''}
        </button>,
      );
    });
    return line;
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
