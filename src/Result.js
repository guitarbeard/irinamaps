import React, { Component } from 'react';
import './Result.css';

class Result extends Component {
  render() {
    const resultStyle = {
      backgroundColor: this.props.color
    };
    return (
      <div className="result" style={resultStyle}>
        <div className="result-text">Meow!</div>
      </div>
    );
  }
}

export default Result;