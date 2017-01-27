import React, { Component } from 'react';
import './EditButtons.scss';

export default class EditButtons extends Component {
  render() {
    return (
      <div>
        <button onClick={() => this.props.onEditLocationClick()} id="edit-home" className="mdl-button mdl-js-button mdl-button--fab">
          <i className="material-icons">edit_location</i>
        </button>
        <div className="mdl-tooltip" htmlFor="edit-home">Edit Location</div>
        <button onClick={() => this.props.onHomeClick()} id="take-me-home" className="mdl-button mdl-js-button mdl-button--fab" type="button">
          <i className="material-icons">my_location</i>
        </button>
        <div className="mdl-tooltip" htmlFor="take-me-home">My Location</div>
      </div>
    );
  }
}
