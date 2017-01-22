import React, { Component } from 'react';

class Result extends Component {
  render() {
    const resultStyle = {
      backgroundColor: this.props.color
    };
    return (
      <li className="result mdl-list__item mdl-list__item--two-line" style={resultStyle}>
        <button className="result-text mdl-list__item-primary-content mdl-button mdl-js-button">
          {this.props.name}
          <div className="result-amount">10 results</div>
        </button>
        <span className="mdl-list__item-secondary-content">
          <button className="mdl-button mdl-js-button mdl-button--icon remove-result">
            <i className="material-icons">clear</i>
          </button>
        </span>
      </li>
    );
  }
}

export default Result;
