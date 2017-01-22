/* global google, navigator */
import _ from "lodash";

import  React, { Component } from 'react';

import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

import SearchBox from "../SearchBox";

import { Layout, Drawer, Content } from 'react-mdl';

import Sidebar from './Sidebar';

const COLORS = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#8BC34A',
  '#FFEB3B',
  '#795548',
  '#FF5722'
];

const MARKER_ICON = {
  path: 'M19.39,1.562c-2.505-1.238-5.94-0.477-8.377,1.643C8.576,1.085,5.141,0.323,2.636,1.562 C-0.357,3.039-0.88,6.782,1.474,9.924l1.962,2.065l0.402,0.425l7.174,7.56l7.174-7.56l0.402-0.425l1.963-2.065 C22.906,6.782,22.383,3.039,19.39,1.562z',
  strokeColor: '#fff',
  fillOpacity: 1,
  strokeOpacity: 0.5,
  anchor: new google.maps.Point(11, 11)
};

const GoogleMapComponent = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={15}
    center={props.center}
    onBoundsChanged={props.onBoundsChanged}
    mapTypeId={google.maps.MapTypeId.ROADMAP}
    options={{
      mapTypeControl:false,
      disableDefaultUI:true,
      zoomControl:true
    }}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
      inputPlaceholder={props.placeholder}
      inputClassName="search-box"
    />
    {props.markers.map((marker, index) => (
      <Marker icon={marker.icon} position={marker.position} key={index} onClick={() => props.onMarkerDelete(marker)} />
    ))}
    {props.userLocationMarker.map((marker) => (
      <Marker zIndex={marker.zIndex} position={marker.position} key={marker.key} onClick={() => props.onMarkerClick(marker)} />
    ))}
  </GoogleMap>
));

class Irinamaps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      colors: COLORS,
      bounds: null,
      center: { lat: 33.690, lng: -117.887 },
      markers: [],
      userLocationMarker: [],
      currColorIndex: 0,
      resultLimit: 10,
      results: []
    }
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleBoundsChanged = this.handleBoundsChanged.bind(this);
  handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
  handlePlacesChanged = this.handlePlacesChanged.bind(this);
  handleMarkerDelete = this.handleMarkerDelete.bind(this);
  handleMarkerClick = this.handleMarkerClick.bind(this);
  handleResultLimitChange = this.handleResultLimitChange.bind(this);
  setUserLocationMarker = this.setUserLocationMarker.bind(this);

  handleResultLimitChange(e) {
    if(e.target.value <= 20) {
      this.setState({
        resultLimit: e.target.value
      });
    } else {
      //TODO: add error message
    }
  }

  setUserLocationMarker(position) {
    const userLocationMarker = [
      {
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
      },
    ];

    let bounds = this._map.getBounds();
    userLocationMarker.map(function(marker) {
      return bounds.extend(marker.position);
    });
    this._map.fitBounds(bounds);
    this.setState({
      bounds: bounds,
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      userLocationMarker: userLocationMarker
    });
  }

  handleMapMounted(map) {
    this._map = map;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setUserLocationMarker, function() {
        //setLocationSearchbox();
      });
    } else {
      // Browser doesn't support Geolocation
      //setLocationSearchbox();
    }
  }

  handleBoundsChanged() {
    this.setState({
      bounds: this._map.getBounds(),
      center: this._map.getCenter()
    });
  }

  handleSearchBoxMounted(searchBox) {
    this._searchBox = searchBox;
  }

  handlePlacesChanged() {
    if(this.state.currColorIndex + 1 > this.state.colors.length) {
      alert('Max Search Limit Reached!')
      return false;
    }

    let iconColor = this.state.colors[this.state.currColorIndex];

    const places = this._searchBox.getPlaces();

    // Add a marker for each place returned from search bar
    let coloredIcon = Object.assign({}, MARKER_ICON);

    coloredIcon.fillColor = iconColor;

    const markers = places.map(place => ({
      position: place.geometry.location,
      icon: coloredIcon
    }));

    const result = {
      name: this._searchBox._inputElement.value,
      color: iconColor
    };

    this.setState((prevState) => ({
      results: _.flattenDeep([prevState.results, result]),
      markers: _.flattenDeep([prevState.markers, markers]),
      currColorIndex: prevState.currColorIndex + 1
    }));

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(function(marker) {
      return bounds.extend(marker.position);
    });

    this.state.markers.map(function(marker) {
      return bounds.extend(marker.position);
    });

    this._searchBox._inputElement.value = '';
    this._map.fitBounds(bounds);
  }

  handleMarkerDelete(targetMarker) {
    /*
     * All you modify is data, and the view is driven by data.
     * This is so called data-driven-development. (And yes, it's now in
     * web front end and even with google maps API.)
     */
    const nextMarkers = this.state.markers.filter(marker => marker !== targetMarker);

    this.setState({
      markers: nextMarkers
    });

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(function(marker) {
      return bounds.extend(marker.position);
    });

    this.state.markers.map(function(marker) {
      return bounds.extend(marker.position);
    });

    this._map.fitBounds(bounds);
  }

  handleMarkerClick(targetMarker) {
    // TODO - trigger info window
    console.log('Meow');
  }

  render() {
    let placeholder = this.state.userLocationMarker ? 'Search...' : 'Set location...';
    return (
      <Layout>
        <Drawer>
          <Sidebar
            results={this.state.results}
            resultLimit={this.state.resultLimit}
            handleResultLimitChange={this.handleResultLimitChange}
          />
        </Drawer>
        <Content>
          <GoogleMapComponent
            containerElement={
              <div style={{ height: `100%` }} />
            }
            mapElement={
              <div style={{ height: `100%` }} />
            }
            center={this.state.center}
            onMapLoad={this.handleMapMounted}
            onBoundsChanged={this.handleBoundsChanged}
            markers={this.state.markers}
            userLocationMarker={this.state.userLocationMarker}
            onMarkerDelete={this.handleMarkerDelete}
            onMarkerClick={this.handleMarkerClick}
            onSearchBoxMounted={this.handleSearchBoxMounted}
            onPlacesChanged={this.handlePlacesChanged}
            bounds={this.state.bounds}
            placeholder={placeholder}
          />
        </Content>
      </Layout>
    );
  }
}

export default Irinamaps;
