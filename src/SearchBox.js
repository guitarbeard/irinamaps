// taken from react-google-maps/src/lib/places/SearchBox.js folder of react-google-maps because the lib/places/SearchBox.js gives errors
/* global google */
import _ from "lodash";

import {
  PropTypes,
} from "react";

import {
  MAP,
  SEARCH_BOX,
} from "react-google-maps/lib/constants";

import {
  addDefaultPrefixToPropTypes,
  collectUncontrolledAndControlledProps,
  default as enhanceElement,
} from "react-google-maps/lib/enhanceElement";

import * as helpers from "./SearchBoxHelper";

import "./SearchBox.scss";

import createReactClass from 'create-react-class';

const controlledPropTypes = {
  // NOTICE!!!!!!
  //
  // Only expose those with getters & setters in the table as controlled props.
  //
  // [].map.call($0.querySelectorAll("tr>td>code", function(it){ return it.textContent; })
  //    .filter(function(it){ return it.match(/^set/) && !it.match(/^setMap/); })
  //
  // https://developers.google.com/maps/documentation/javascript/3.exp/reference#SearchBox
  bounds: PropTypes.any,
  inputProps: PropTypes.object,
  inputStyle: PropTypes.object,
  inputClassName: PropTypes.string,
};

const defaultUncontrolledPropTypes = addDefaultPrefixToPropTypes(controlledPropTypes);

const eventMap = {
  // https://developers.google.com/maps/documentation/javascript/3.exp/reference#SearchBox
  // [].map.call($0.querySelectorAll("tr>td>code"), function(it){ return it.textContent; })
  onPlacesChanged: `places_changed`,
};

const publicMethodMap = {
  // Public APIs
  //
  // https://developers.google.com/maps/documentation/javascript/3.exp/reference#SearchBox
  //
  // [].map.call($0.querySelectorAll("tr>td>code"), function(it){ return it.textContent; })
  //    .filter(function(it){ return it.match(/^get/) && !it.match(/Map$/); })
  setBounds(searchBox, bounds) {
    if(Array.isArray(bounds)) {
      bounds = bounds[0];
    }
    return searchBox.setBounds(bounds);
   },

  getBounds(searchBox) { return searchBox.getBounds(); },

  getPlaces(searchBox) { return searchBox.getPlaces(); },
  // END - Public APIs
};

const controlledPropUpdaterMap = {
  bounds(searchBox, bounds) {
    searchBox.setBounds(bounds);
  },
};

function getInstanceFromComponent(component) {
  return component.state[SEARCH_BOX];
}

export default _.flowRight(
  createReactClass,
  enhanceElement(getInstanceFromComponent, publicMethodMap, eventMap, controlledPropUpdaterMap),
)({
  displayName: `SearchBox`,

  propTypes: {
    ...controlledPropTypes,
    ...defaultUncontrolledPropTypes,
    controlPosition: PropTypes.any.isRequired,
    inputProps: PropTypes.object,
    inputStyle: PropTypes.object,
    inputClassName: PropTypes.string,
    inputPlaceholder: PropTypes.string,
  },

  contextTypes: {
    [MAP]: PropTypes.object,
  },

  componentWillMount() {
    this._inputElement = helpers.createInputElement(this.props);
    // https://developers.google.com/maps/documentation/javascript/3.exp/reference#SearchBox
    const searchBox = new google.maps.places.SearchBox(this._inputElement,
      collectUncontrolledAndControlledProps(
        defaultUncontrolledPropTypes,
        controlledPropTypes,
        this.props
      )
    );
    this.setState({
      [SEARCH_BOX]: searchBox,
    });
  },

  componentDidMount() {
    this._mountIndex = helpers.mountInputElementToControlPositionOnMap(
      this._inputElement,
      this.props.controlPosition,
      this.context[MAP],
    );
  },

  componentDidUpdate(prevProps) {
    if (this.props.controlPosition !== prevProps.controlPosition) {
      helpers.unmountInputElementFromControlPositionOnMap(
        this._mountIndex,
        prevProps.controlPosition,
        this.context[MAP],
      );
      this._mountIndex = helpers.mountInputElementToControlPositionOnMap(
        this._inputElement,
        this.props.controlPosition,
        this.context[MAP],
      );
    }
  },

  componentWillUnmount() {
    if (this._mountIndex) {
      helpers.unmountInputElementFromControlPositionOnMap(
        this._mountIndex,
        this.props.controlPosition,
        this.context[MAP],
      );
      this._inputElement = null;
    }
  },

  render() {
    return false;
  },
});
