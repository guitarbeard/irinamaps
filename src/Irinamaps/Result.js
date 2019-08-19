import React, { Component } from 'react';
import './Result.scss';

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMarkersList: false
    }
  }

  toggleMarkersList = () => {
    this.setState(prevState => ({
      showMarkersList: !prevState.showMarkersList
    }));
  }

  render() {
    if (this.props.result.markers && this.props.result.markers.length) {
      let resultStyle = {
        backgroundColor: this.props.result.color
      };
      let resultPlural = this.props.result.markers.length > 1 ? 's' : '';
      let name = this.props.colorBlindMode ? this.props.resultNum + ' - ' + this.props.result.name : this.props.result.name;
      let resultLetter = this.props.colorBlindMode ? this.props.resultNum : this.props.result.name.substr(0,3);
      return (
        <li className="result animated bounceInLeft" style={resultStyle}>
          <div className="result-info mdl-list__item mdl-list__item--two-line">
            <span className="mdl-list__item-secondary-content">
              <button onClick={() => this.props.onResultDelete(this.props.result)} className="mdl-button mdl-js-button mdl-button--icon remove-result">
                <i className="material-icons">clear</i>
              </button>
              <div className="result-letter">{resultLetter}</div>
            </span>
            <button onClick={() => this.props.onResultClick([this.props.result])} className="result-text mdl-list__item-primary-content mdl-button mdl-js-button">
              <div className="text-wrap">{name}</div>
              <div className="result-amount">{this.props.result.markers.length} result{resultPlural}</div>
            </button>
            <span className="mdl-list__item-secondary-content">
              <button onClick={this.toggleMarkersList} className="mdl-button mdl-js-button mdl-button--icon expand-markers">
                {this.state.showMarkersList ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
              </button>
              <div className="result-letter">{resultLetter}</div>
            </span>
          </div>
          {this.state.showMarkersList ? <ul className="markers-list">
            {this.props.result.markers.map((marker, index) => (
              <li key={index}>
                <span className="mdl-list__item-secondary-content">
                  <button onClick={() => this.props.onMarkerDelete(marker)} className="mdl-button mdl-js-button mdl-button--icon remove-marker">
                    <i className="material-icons">clear</i>
                  </button>
                </span>
                <button onClick={() => this.props.onMarkerClick(marker)} className="result-text mdl-list__item-primary-content mdl-button mdl-js-button">
                  {marker.place.name === '' ? marker.result.name : marker.place.name}
                </button>
              </li>
            ))}
          </ul> : null }
        </li>
      );
    } else {
      return false;
    }
  }
}
