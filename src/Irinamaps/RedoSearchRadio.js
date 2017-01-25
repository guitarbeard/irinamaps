import React, { Component } from 'react';
import { RadioGroup, Radio } from 'react-mdl';

export default class RedoSearchRadio extends Component {
  render() {
    return (
      <RadioGroup onChange={this.props.onChange} container="div" childContainer="div" name="redo-search" value={this.props.value}>
        <Radio value="true">Redo all searches in new location</Radio>
        <Radio value="false">Keep existing search results</Radio>
      </RadioGroup>
    );
  }
}
