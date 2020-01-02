import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Piece extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    const { color } = this.props;
    return (
      <div style={{ backgroundColor: color === 1 ? '#000' : '#FFF' }} className="piece" />
    );
  }
}

Piece.propTypes = {
  color: PropTypes.number.isRequired,
};

export default Piece;
