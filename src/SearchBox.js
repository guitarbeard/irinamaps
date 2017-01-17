import React, { Component } from 'react';
import './SearchBox.css';

export default class SearchBox extends Component {
  render() {
    return (
      <input id="search-box" className="controls" type="text" placeholder={this.props.placeholder} />
    );
  }
}
