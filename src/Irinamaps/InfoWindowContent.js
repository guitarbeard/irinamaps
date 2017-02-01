import React, { Component } from 'react';
import './InfoWindowContent.scss';

export default class InfoWindowContent extends Component {
  render() {
    let photo, openNow, url;

    if (this.props.place.photos){
      const img = {
        backgroundImage: 'url(' + this.props.place.photos[0].getUrl({'maxHeight': 500, 'maxWidth': 500}) + ')'
      };
      const imgAttribution = {
        __html: this.props.place.photos[0].html_attributions[0]
      };
      photo = (
        <div>
          <div className="place-img" style={img} />
          <span className="attribution" dangerouslySetInnerHTML={imgAttribution} />
          <br />
        </div>
      );
    }

    if (this.props.place.opening_hours) {
      if (this.props.place.opening_hours.open_now) {
        openNow = <div className="openNow">Open meow!</div>;
      } else {
        openNow = <div className="closedNow">closed :(</div>;
      }
    }

    if(!this.props.place.url) {
      url = 'https://maps.google.com/?q='+this.props.place.name+' '+this.props.place.formatted_address;
    } else {
      url = this.props.place.url;
    }


    return (
      <div className="info-window">
        {photo}
        <strong>{this.props.place.name}</strong>
        <address>
          {this.props.place.formatted_address}
          {openNow}
        </address>
        <div className="btn-group-justified">
          <button onClick={this.props.onMarkerDelete} type="button" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--raised mdl-button--accent btn-cancel btn">remove</button>
          <button onClick={this.props.onMarkerKeep} type="button" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--raised mdl-button--accent btn-ok btn">keep only</button>
          <button onClick={this.props.onAddWaypoint} type="button" className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--raised mdl-button--accent btn-add-to-route">Add to Route</button>
          <a className="btn-block mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect btn-directions" href={url} target="_blank">
            Get Directions
          </a>
        </div>
      </div>
    );
  }
}
