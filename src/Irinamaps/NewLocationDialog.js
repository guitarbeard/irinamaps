import React, { Component } from 'react';
import RedoSearchRadio from './RedoSearchRadio';

export default class NewLocationDialog extends Component {
  render() {
    return (
      <div className="info-window">
        <strong className="keep-text">Keep new location?</strong>
        {this.props.showRedoSearch &&
          <RedoSearchRadio onChange={this.props.handleRedoSearch} value={this.props.redoSearch}/>
        }
        <div className="btn-group-justified">
          <button onClick={this.props.onMarkerDelete} type="button" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect btn-remove btn">cancel</button>
          <button onClick={this.props.onMarkerKeep} type="button" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect btn-keep btn">keep</button>
        </div>
      </div>
    );
  }
}
