/* global google, navigator */
import  React, { Component } from 'react';

import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

import SearchBox from "../SearchBox";

import { Layout, Drawer, Content } from 'react-mdl';

import Sidebar from './Sidebar';

const INPUT_STYLE = {
  top: `0`,
  position: `fixed`,
  backgroundColor: `#fff`,
  fontFamily: `Roboto`,
  fontSize: `15px`,
  fontWeight: `300`,
  padding: `20px 25px 20px 50px`,
  textOverflow: `ellipsis`,
  width: `216px`,
  marginLeft: `12px`,
  zIndex: `6`,
  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
  borderRadius: `2px 0 0 2px`,
  outline: `none`,
  boxSizing: `border-box`,
  MozBoxSizing: `border-box`,
  border: `1px solid transparent`,
  height: `32px`,
  marginTop: `10px`
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
      inputStyle={INPUT_STYLE}
    />
    {props.markers.map((marker, index) => (
      <Marker position={marker.position} key={index} onClick={() => props.onMarkerClick(marker)} />
    ))}
    {props.userLocationMarker.map((marker, index) => (
      <Marker position={marker.position} key={index} onClick={() => props.onMarkerClick(marker)} />
    ))}
  </GoogleMap>
));

const icon = {
  path: 'M19.39,1.562c-2.505-1.238-5.94-0.477-8.377,1.643C8.576,1.085,5.141,0.323,2.636,1.562 C-0.357,3.039-0.88,6.782,1.474,9.924l1.962,2.065l0.402,0.425l7.174,7.56l7.174-7.56l0.402-0.425l1.963-2.065 C22.906,6.782,22.383,3.039,19.39,1.562z',
  strokeColor: '#fff',
  fillOpacity: 1,
  strokeOpacity: 0.5,
  anchor: new google.maps.Point(11, 11)
};

class Irinamaps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      colors: [
        '#E91E63',
        '#9C27B0',
        '#3F51B5',
        '#2196F3',
        '#009688',
        '#8BC34A',
        '#FFEB3B',
        '#795548',
        '#FF5722'
      ],
      bounds: null,
      center: { lat: 33.690, lng: -117.887 },
      markers: [],
      userLocationMarker: [],
      usedColors: [],
      resultLimit: 10,
      results: [],
      placeholder: ''
    }
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleBoundsChanged = this.handleBoundsChanged.bind(this);
  handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
  handlePlacesChanged = this.handlePlacesChanged.bind(this);
  handleMarkerClick = this.handleMarkerClick.bind(this);
  handleResultLimitChange = this.handleResultLimitChange.bind(this);
  setUserLocationMarker = this.setUserLocationMarker.bind(this);
  getIconColor = this.getIconColor.bind(this);

  getIconColor() {
    if(this.state.colors.length > 0) {
      this.setState((prevState) => ({
        colors: prevState.colors.slice(0, prevState.colors.length - 2),
        usedColors: prevState.usedColors.concat(prevState.colors.slice(prevState.colors.length - 2, prevState.colors.length - 1))
      }));
      return this.state.usedColors[this.state.usedColors.length - 1];
    } else {
      return false;
    }
  }

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
        defaultAnimation: 2,
        zIndex: google.maps.Marker.MAX_ZINDEX + 1,
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
    let iconColor = this.getIconColor();
    if(!iconColor) {
      return false;
    }
    const places = this._searchBox.getPlaces();

    // Add a marker for each place returned from search bar
    let coloredIcon = Object.assign({}, icon);
    coloredIcon.fillColor = iconColor;
    const markers = places.map(place => ({
      position: place.geometry.location,
      defaultAnimation: 2,
      icon: coloredIcon
    }));

    // Set markers; set map center to first search result
    const mapCenter = markers.length > 0 ? markers[0].position : this.state.center;

    this.setState({
      center: mapCenter,
      markers,
    });
  }

  handleMarkerClick(targetMarker) {
    /*
     * All you modify is data, and the view is driven by data.
     * This is so called data-driven-development. (And yes, it's now in
     * web front end and even with google maps API.)
     */
    const nextMarkers = this.state.markers.filter(marker => marker !== targetMarker);
    // Set markers; set map center to first search result
    const mapCenter = nextMarkers.length > 0 ? nextMarkers[0].position : this.state.center;
    this.setState({
      center: mapCenter,
      markers: nextMarkers
    });
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
