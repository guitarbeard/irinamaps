import React, { Component } from 'react';
import { RadioGroup, Radio } from 'react-mdl';
import './RedoSearchRadio.scss';

export default class RedoSearchRadio extends Component {
  render() {
    return (
      <RadioGroup onChange={this.props.onChange} container="div" childContainer="div" name="redo-search" value={this.props.value}>
        <Radio value={1}>Redo all searches in new location</Radio>
        <Radio value={0}>Keep existing search results</Radio>
      </RadioGroup>
    );
  }
}
