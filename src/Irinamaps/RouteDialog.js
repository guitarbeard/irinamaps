import React, { Component } from 'react';
import './RouteDialog.scss';

export default class RouteDialog extends Component {
  render() {
    let isActive = this.props.open ? 'active' : '';
    return (
      <div id="route-dialog" className={isActive}>
        <div className="dialog-container">
          <h4>Route Waypoints</h4>
          <ul className="waypoint-list">
            {this.props.waypoints.map((waypoint, index) => (
              <li key={index}><i className="material-icons">more_vert</i>{waypoint.place.name}</li>
            ))}
          </ul>
          {this.props.waypoints.length > 0 &&
            <button onClick={this.props.onClose} type="button" className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--accent get-directions">Get Directions</button>
          }
          <button onClick={this.props.onClose} type="button" className="mdl-button mdl-js-button">close</button>
        </div>
        <div className="overlay" />
      </div>
    );
  }
}
