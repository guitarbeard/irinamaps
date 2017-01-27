import React, { Component } from 'react';
import { Textfield } from 'react-mdl';
import Result from './Result';
import './Sidebar.scss';

export default class Sidebar extends Component {
  render() {
    return (
      <div>
        <div id="result-limit-num-wrap">
          <Textfield
            onChange={this.props.onResultLimitChange}
            pattern="-?[0-9]*(\.[0-9]+)?"
            error="Input is not a number!"
            label="Max Results"
            floatingLabel
            value={this.props.resultLimit}
          />
        </div>
        <ul id="results-wrap" className='mdl-list'>
        {this.props.results.map((result, index) => (
          <Result result={result} key={index} onResultClick={this.props.onResultClick} onResultDelete={this.props.onResultDelete} />
        ))}
        </ul>
      </div>
    );
  }
}
