import React, { Component } from 'react';
import { Textfield, Checkbox, Button } from 'react-mdl';
import Result from './Result';
import './Sidebar.scss';

export default class Sidebar extends Component {
  render() {
    return (
      <div>
        <div>
          <div id="result-limit-num-wrap">
            <Textfield
              onChange={this.props.onResultLimitChange}
              pattern="-?[0-9]*(\.[0-9]+)?"
              error="Input is not a number!"
              label="Max"
              floatingLabel
              value={this.props.resultLimit}
            />
          </div>
          <div id="color-blind-mode-wrap">
            <Checkbox label="Color Blind Mode" ripple checked={this.props.colorBlindMode} onChange={this.props.onColorBlindModeChange} />
          </div>
        </div>
        <div id="route-btn-wrap">
          <Button type="button" raised accent ripple onClick={this.props.onRouteBtnClick}>Route Planner</Button>
        </div>
        <ul id="results-wrap" className='mdl-list'>
        {this.props.results.map((result, index) => (
          <Result resultNum={index + 1} colorBlindMode={this.props.colorBlindMode} result={result} key={index} onResultClick={this.props.onResultClick} onResultDelete={this.props.onResultDelete} />
        ))}
        </ul>
      </div>
    );
  }
}
