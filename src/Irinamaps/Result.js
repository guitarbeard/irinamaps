import React, { Component } from 'react';

export default class Result extends Component {
  render() {
    if (this.props.result.markers && this.props.result.markers.length) {
      let resultStyle = {
        backgroundColor: this.props.result.color
      };
      let resultPlural = this.props.result.markers.length > 1 ? 's' : '';
      return (
        <li className="result mdl-list__item mdl-list__item--two-line" style={resultStyle}>
          <button onClick={() => this.props.onResultClick([this.props.result])} className="result-text mdl-list__item-primary-content mdl-button mdl-js-button">
            <div className="text-wrap">{this.props.result.name}</div>
            <div className="result-amount">{this.props.result.markers.length} result{resultPlural}</div>
          </button>
          <span className="mdl-list__item-secondary-content">
            <button onClick={() => this.props.onResultDelete(this.props.result)} className="mdl-button mdl-js-button mdl-button--icon remove-result">
              <i className="material-icons">clear</i>
            </button>
            <div className="result-letter">{this.props.result.name[0]}</div>
          </span>
        </li>
      );
    } else {
      return false;
    }
  }
}
