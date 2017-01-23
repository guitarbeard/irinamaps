/* global google, navigator */
import _ from 'lodash';

import  React, { Component } from 'react';

import { withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';

import SearchBox from '../SearchBox';

import { Layout, Drawer, Content } from 'react-mdl';

import Sidebar from './Sidebar';

import EditButtons from './EditButtons';

import InfoWindowContent from './InfoWindowContent';

const COLORS = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#8BC34A',
  '#FFC107',
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
    onZoomChanged={props.onZoomChanged}
    mapTypeId={google.maps.MapTypeId.ROADMAP}
    zoom={props.zoom}
    bounds={props.bounds}
    options={{
      mapTypeControl:false,
      disableDefaultUI:true,
      zoomControl:true
    }}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.searchBounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
      inputPlaceholder="Search..."
      inputClassName="search-box"
    />
    {props.userLocationMarker.map(marker => (
      <Marker zIndex={marker.zIndex} position={marker.position} key={marker.key} onClick={() => props.onMarkerClick(marker, true)} />
    ))}
    {props.results.map(result => result.markers.map((marker, index) => (
      <Marker icon={marker.icon} position={marker.position} key={index} onClick={() => props.onMarkerClick(marker)}>
        {marker.showInfo && (
          <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
            <InfoWindowContent onMarkerKeep={() => props.onMarkerKeep(marker)} onMarkerDelete={() => props.onMarkerDelete(marker)} place={marker.place} />
          </InfoWindow>
        )}
      </Marker>
    )))}
  </GoogleMap>
));

export default class Irinamaps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bounds: null,
      searchBounds: null,
      center: { lat: 33.690, lng: -117.887 },
      userLocationMarker: [],
      usedColors: [],
      resultLimit: 10,
      results: [],
      zoom: 15
    }
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleBoundsChanged = this.handleBoundsChanged.bind(this);
  handleZoomChanged = this.handleZoomChanged.bind(this);
  handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
  handlePlacesChanged = this.handlePlacesChanged.bind(this);
  handleMarkerDelete = this.handleMarkerDelete.bind(this);
  handleResultDelete = this.handleResultDelete.bind(this);
  handleMarkerKeep = this.handleMarkerKeep.bind(this);
  handleMarkerClick = this.handleMarkerClick.bind(this);
  handleResultLimitChange = this.handleResultLimitChange.bind(this);
  zoomToUserLocation = this.zoomToUserLocation.bind(this);
  editUserLocationMarker = this.editUserLocationMarker.bind(this);
  setUserLocationMarker = this.setUserLocationMarker.bind(this);
  handleMarkerClose = this.handleMarkerClose.bind(this);
  handleResultClick = this.handleResultClick.bind(this);

  handleResultClick(targetResult) {
    // focus on results
    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

    targetResult.markers.map(marker => bounds.extend(marker.position));

    this._map.fitBounds(bounds);
  }

  handleResultDelete(targetResult) {
    let removedColor = false;
    const nextResults = this.state.results.filter(result => {
      if (result === targetResult) {
        // remove color from usedColors
        removedColor = result.color;
        return false;
      } else {
        return result;
      }
    });

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

    nextResults.map(result => result.markers.map(marker => bounds.extend(marker.position)));

    this._map.fitBounds(bounds);
    this.setState(prevState => ({
      results: nextResults,
      usedColors: prevState.usedColors.filter(color => color !== removedColor)
    }));
  }

  handleResultLimitChange(e) {
    if (e.target.value <= 20) {
      this.setState({
        resultLimit: e.target.value
      });
    } else {
      // TODO - add MaterialSnackbar error message
      this.setState({
        resultLimit: 20
      });
    }
  }

  zoomToUserLocation() {
    if (this.state.userLocationMarker.length) {
      this.setState({
        zoom: 15,
        center: this.state.userLocationMarker[0].position
      });
    }
  }

  editUserLocationMarker() {
    this._searchBox._inputElement.focus();
    this.setState({
      userLocationMarker: []
    });
    // TODO - set search box to set user location marker
  }

  setUserLocationMarker(position) {
    let center = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    const userLocationMarker = [
      {
        position: center,
        key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
      },
    ];

    let bounds = this._map.getBounds();
    userLocationMarker.map(function(marker) {
      return bounds.extend(marker.position);
    });

    let searchBounds = new google.maps.Circle({center: center, radius: 30}).getBounds()

    this.setState({
      searchBounds,
      bounds,
      center,
      userLocationMarker
    });
  }

  handleMapMounted(map) {
    this._map = map;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setUserLocationMarker, this.editUserLocationMarker);
    } else {
      // Browser doesn't support Geolocation
      this.editUserLocationMarker()
    }
  }

  handleBoundsChanged() {
    this.setState({
      bounds: this._map.getBounds(),
      center: this._map.getCenter()
    });
  }

  handleZoomChanged() {
    this.setState({
      zoom: this._map.getZoom()
    });
  }

  handleSearchBoxMounted(searchBox) {
    this._searchBox = searchBox;
  }

  handlePlacesChanged() {
    if (this.state.usedColors.length === COLORS.length) {
      // TODO - turn into MaterialSnackbar message
      alert('Max Searches Reached!')
      return false;
    }

    const places = this._searchBox.getPlaces();

    if (!places.length) {
      // TODO - turn into MaterialSnackbar message
      alert('No results found :(')
      return false;
    }

    let limit = Number(this.state.resultLimit);

    const filteredPlaces = places.filter((value, index) => {
      return index < limit;
    });

    let iconColor = COLORS.filter(color => {
      if(this.state.usedColors.length === 0) {
        return color;
      } else {
        if(this.state.usedColors.indexOf(color) === -1) {
          return color;
        } else {
          return false;
        }
      }
    });

    iconColor = iconColor[0];

    // Add a marker for each place returned from search bar
    let coloredIcon = Object.assign({}, MARKER_ICON);
    coloredIcon.fillColor = iconColor;

    const markers = filteredPlaces.map(place => ({
      position: place.geometry.location,
      icon: coloredIcon,
      showInfo: false,
      place
    }));

    const result = {
      name: this._searchBox._inputElement.value,
      color: iconColor,
      markers: markers
    };

    this.setState(prevState => ({
      results: _.flattenDeep([prevState.results, result]),
      usedColors: _.flatten([prevState.usedColors, iconColor])
    }));

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

    this.state.results.map(result => result.markers.map(marker => bounds.extend(marker.position)));

    this._searchBox._inputElement.value = '';
    this._map.fitBounds(bounds);
  }

  handleMarkerDelete(targetMarker) {
    let removedColor = false;
    const nextResults = this.state.results.filter(result => {
      if (result.color === targetMarker.icon.fillColor) {
        result.markers = result.markers.filter(marker => marker !== targetMarker);
        if (result.markers.length) {
          return result;
        } else {
          // remove color from usedColors
          removedColor = result.color;
          return false;
        }
      } else {
        return result;
      }
    });

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

    nextResults.map(result => result.markers.map(marker => bounds.extend(marker.position)));

    this._map.fitBounds(bounds);
    this.setState(prevState => ({
      results: nextResults,
      usedColors: prevState.usedColors.filter(color => color !== removedColor)
    }));
  }

  handleMarkerKeep(targetMarker) {
    const nextResults = this.state.results.map(result => {
      if (result.color === targetMarker.icon.fillColor) {
        result.markers = result.markers.filter(marker => marker === targetMarker);
      }
      return result;
    });

    let bounds = new google.maps.LatLngBounds();

    this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

    nextResults.map(result => result.markers.map(marker => bounds.extend(marker.position)));

    this._map.fitBounds(bounds);
    this.setState({
      results: nextResults
    });
  }

  handleMarkerClick(targetMarker, isUserLocationMarker) {
    if (isUserLocationMarker) {
      this.zoomToUserLocation();
    } else {
      this.setState({
        results: this.state.results.map(result => {
          if (result.color === targetMarker.icon.fillColor) {
            result.markers = result.markers.map(marker => {
              if (marker === targetMarker) {
                return {
                  ...marker,
                  showInfo: true,
                };
              }
              return marker;
            });
          }
          return result;
        })
      });
    }
  }

  handleMarkerClose(targetMarker) {
    this.setState({
      results: this.state.results.map(result => {
        if (result.color === targetMarker.icon.fillColor) {
          result.markers = result.markers.map(marker => {
            if (marker === targetMarker) {
              return {
                ...marker,
                showInfo: false,
              };
            }
            return marker;
          });
        }
        return result;
      })
    });
  }

  render() {
    return (
      <Layout>
        <Drawer>
          <Sidebar
            results={this.state.results}
            resultLimit={this.state.resultLimit}
            onResultLimitChange={this.handleResultLimitChange}
            onResultClick={this.handleResultClick}
            onResultDelete={this.handleResultDelete}
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
            results={this.state.results}
            zoom={this.state.zoom}
            center={this.state.center}
            onMapLoad={this.handleMapMounted}
            onBoundsChanged={this.handleBoundsChanged}
            onZoomChanged={this.handleZoomChanged}
            userLocationMarker={this.state.userLocationMarker}
            onMarkerDelete={this.handleMarkerDelete}
            onMarkerKeep={this.handleMarkerKeep}
            onMarkerClick={this.handleMarkerClick}
            onSearchBoxMounted={this.handleSearchBoxMounted}
            onPlacesChanged={this.handlePlacesChanged}
            bounds={this.state.bounds}
            searchBounds={this.state.searchBounds}
            onMarkerClose={this.handleMarkerClose}
          />
          <EditButtons onHomeClick={this.zoomToUserLocation} onEditLocationClick={this.editUserLocationMarker} />
        </Content>
      </Layout>
    );
  }
}
