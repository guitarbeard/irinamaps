/* global google, navigator, document */
import _ from 'lodash';
import  React, { Component } from 'react';
import { withGoogleMap, Marker, InfoWindow } from 'react-google-maps';
import GoogleMap from '../GoogleMap';
import SearchBox from '../SearchBox';
import { Layout, Drawer, Content, Snackbar, Spinner, Checkbox } from 'react-mdl';
import ReactModal from 'react-modal';
import Sidebar from './Sidebar';
import EditButtons from './EditButtons';
import InfoWindowContent from './InfoWindowContent';
import NewLocationDialog from './NewLocationDialog';
import RedoSearchRadio from './RedoSearchRadio'

const MAX_SEARCH = 9;

const COLORS = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#8BC34A',
  '#FFC107',
  '#FF5722',
  '#795548',
];

const NIGHT_MODE = [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ];

const storageAvailable = function storageAvailable(type) {
  try {
    var storage = window[type],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

const createMarkerIcon = function createMarkerIcon(text, fillColor) {
  return  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M19.39,1.562c-2.505-1.238-5.94-0.477-8.377,1.643C8.576,1.085,5.141,0.323,2.636,1.562 C-0.357,3.039-0.88,6.782,1.474,9.924l1.962,2.065l0.402,0.425l7.174,7.56l7.174-7.56l0.402-0.425l1.963-2.065 C22.906,6.782,22.383,3.039,19.39,1.562z" fill-opacity="1" stroke-width="1" stroke="#ffffff" fill="${fillColor}"></path><text x="8" y="14" font-family="Helvetica" font-size="11" stroke="none" fill="white">${text}</text></svg>`;
}

const GoogleMapComponent = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={15}
    center={props.center}
    onZoomChanged={props.onZoomChanged}
    onCenterChanged={props.onCenterChanged}
    mapTypeId={google.maps.MapTypeId.ROADMAP}
    zoom={props.zoom}
    bounds={props.bounds}
    onRightClick={props.onMapClick}
    options={{
      styles: props.nightMode,
      mapTypeControl:false,
      disableDefaultUI:true,
      zoomControl:true,
      clickableIcons: false,
      gestureHandling: 'greedy'
    }}
  >
    {props.initLocation ?
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.searchBounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
      inputClassName="search-box"
    /> : null}
    {props.userLocationMarker.map(marker => (
      <Marker zIndex={marker.zIndex} position={marker.position} key={marker.key} onClick={() => props.onMarkerClick(marker, true)}>
        {marker.showInfo && (
          <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
            <NewLocationDialog showRedoSearch={props.results.length > 0} redoSearch={props.redoSearch} handleRedoSearch={props.handleRedoSearch} onMarkerKeep={() => props.onNewLocationKeep(marker)} onMarkerDelete={() => props.onMarkerClose(marker)} />
          </InfoWindow>
        )}
      </Marker>
    ))}
    {props.results.map((result, resultIndex) => result.markers.map((marker, index) => {
      let markerNum = props.colorBlindMode ? resultIndex + 1 : '';
      let icon = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(createMarkerIcon(markerNum, marker.iconColor));
      return (
        <Marker icon={icon} position={marker.position} key={index} onClick={() => props.onMarkerClick(marker)}>
          {marker.showInfo && (
            <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
              <InfoWindowContent onMarkerKeep={() => props.onMarkerKeep(marker)} onMarkerDelete={() => props.onMarkerDelete(marker)} place={marker.place} result={result} />
            </InfoWindow>
          )}
        </Marker>
      );
    }))}
  </GoogleMap>
));

export default class Irinamaps extends Component {

  constructor(props) {
    super(props);
    let cachedHideWelcome = false;
    if (storageAvailable('localStorage')) {
      cachedHideWelcome = localStorage.getItem('hideWelcome') === 'true' ? true : false;
    }
    ReactModal.setAppElement('#root');
    this.state = {
      bounds: new google.maps.Circle({center: { lat: 33.690, lng: -117.887 }, radius: 30}).getBounds(),
      searchBounds: new google.maps.Circle({center: { lat: 33.690, lng: -117.887 }, radius: 30}).getBounds(),
      center: { lat: 33.690, lng: -117.887 },
      userLocationMarker: [],
      remainingColors: COLORS,
      resultLimit: 10,
      results: [],
      zoom: 15,
      isSnackbarActive: false,
      snackbarText: '',
      redoSearch: 0,
      isLoading: true,
      initLocation: false,
      colorBlindMode: false,
      nightMode: false,
      openModal: cachedHideWelcome ? false : true,
      hideWelcome: cachedHideWelcome
    }
  }

  componentDidMount() {
    // focus when closing sidebar
    document.getElementsByClassName('mdl-layout__obfuscator')[0].addEventListener('click', () => {
      this._searchBox._inputElement.focus()
    }, false);
  }

  handleRedoSearch = (redoSearch) => {
    this.setState({
      redoSearch: Number(redoSearch.target.value)
    });
  }

  handleNewLocationKeep = (marker) => {
    this.redoSearchesInNewLocation(marker, () => {
      this.setUserLocationMarker({geometry:{location: marker.position}});
    });
  }

  redoSearchesInNewLocation = (marker, callback) => {
    this.setState({
      isLoading: true
    });

    if(this.state.redoSearch && this.state.results.length > 0) {
      let placesService = new google.maps.places.PlacesService(this._map.getMap());
      let that = this, results = [], stateResults = this.state.results, stateResultLimit = this.state.resultLimit;

      let redoResultSearch = function redoResultSearch(index) {
        let result = stateResults[index];
        let center;
        if(marker.hasOwnProperty('geometry')) {
          // came from a search result
          center = marker.geometry.location;
        } else {
          // geolocation result
          center = marker.position;
        }
        let request = {
          location: center,
          radius: '30',
          query: result.name
        };

        placesService.textSearch(request, function resolveTextSearch(places, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            let limit = Number(stateResultLimit);

            const filteredPlaces = places.filter((value, index) => {
              return index < limit;
            });
            // Add a marker for each place returned from search bar
            const markers = filteredPlaces.map(place => ({
              position: place.geometry.location,
              iconColor: result.color,
              showInfo: false,
              place
            }));

            const newResult = {
              name: result.name,
              color: result.color,
              markers: markers
            };

            results.push(newResult);
          }
          // check if last result, else run again
          if(index === stateResults.length - 1){
            that.setState({
              results,
              isLoading: false
            }, callback);
          }else{
            redoResultSearch(index + 1);
          }
        });
      };
      redoResultSearch(0);
    } else {
      this.setState({
        isLoading: false
      }, callback);
    }
  }

  handleMapClick = (event) => {
    // close all info windows
    this.setState({
      results: this.state.results.map(result => {
        result.markers = result.markers.map(marker => {
          return {
            ...marker,
            showInfo: false,
          };
        });
        return result;
      })
    });
    if(!event.placeId) {
      if(this.state.userLocationMarker.length === 0) {
        // just set it, if no location
        this.redoSearchesInNewLocation({ position: event.latLng, key: Date.now() }, () => {
          this.setUserLocationMarker({geometry:{location: event.latLng}});
        });
      } else {
        this.setTempUserLocationMarker(event.latLng);
      }
    }
  }

  setTempUserLocationMarker = (position) => {
    const tempUserLocationMarker = { position: position, key: Date.now(), showInfo: true, isTemp: true };
    this.setState(prevState => ({
      userLocationMarker: [prevState.userLocationMarker[0], tempUserLocationMarker],
      center: position
    }));
  }

  setBounds = (targetResults) => {
    if(this.state.results.length === 0) {
      // set zoom to a reasonable amount if no search results and center on user
      this.setState({
        zoom: 15,
        center: this.state.userLocationMarker[0].position
      });
    } else {
      if(!targetResults) {
        targetResults = this.state.results;
      }

      let bounds = new google.maps.LatLngBounds();

      this.state.userLocationMarker.map(marker => bounds.extend(marker.position));

      if(targetResults) {
        targetResults.map(result => result.markers.map(marker => bounds.extend(marker.position)));
      }
      this._map.fitBounds(bounds);
    }
  }

  handleResultDelete = (targetResult) => {
    let remainingColors = this.state.remainingColors;
    const results = this.state.results.filter((result, index) => {
      if (result === targetResult) {
        remainingColors.unshift(result.color);
        return false;
      } else {
        return true;
      }
    });
    this.setState(prevState => ({
      results,
      remainingColors
    }), this.setBounds);
  }

  handleResultLimitChange = (e) => {
    let tooBig = false, tooSmall = false;
    if(e.target.value > 20) {
      tooBig = true;
    }
    if(e.target.value <= 0){
      tooSmall = true;
    }
    if (!tooBig && !tooSmall) {
      this.setState({
        resultLimit: e.target.value
      });
    } else {
      let resultLimit = tooSmall ? 1 : 20;
      this.setState({
        resultLimit,
        isSnackbarActive: true,
        snackbarText: (
          <div>
            {tooSmall ? 'Min' : 'Max' } result limit is {resultLimit}
            <i className="material-icons">warning</i>
          </div>
        )
      });
    }
  }

  zoomToUserLocation = () => {
    if (this.state.userLocationMarker.length) {
      this.setState({
        zoom: 15,
        center: this.state.userLocationMarker[0].position
      });
    }
  }

  editUserLocationMarker = (error) => {
    this.setState({
      isLoading: false,
      initLocation: true,
      userLocationMarker: []
    });

    this._searchBox._inputElement.focus();
    if(error) {
      this.setState({
        isSnackbarActive: true,
        snackbarText: (
          <div>
            Please set your location.
            <i className="material-icons">edit_location</i>
          </div>
        )
      });
    }
    // the SearchBox inputPlaceholder prop doesn't seem to update so I'll do it manually :(
    this._searchBox._inputElement.setAttribute('placeholder', 'Set location...');
  }

  setUserLocationMarker = (position) => {
    let center;
    if(position.hasOwnProperty('geometry')) {
      // came from a search result
      center = position.geometry.location;
    } else {
      // geolocation result
      center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    }

    const userLocationMarker = [{ position: center, key: Date.now() }];

    let searchBounds = new google.maps.Circle({center: center, radius: 30}).getBounds();

    this.setState({
      searchBounds,
      userLocationMarker,
      isLoading: false,
      initLocation: true,
    }, this.setBounds);

    this._searchBox._inputElement.setAttribute('placeholder', 'Search...');
    this._searchBox._inputElement.value = '';
  }

  handleMapMounted = (map) => {
    this._map = map;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setUserLocationMarker, () => this.editUserLocationMarker(true));
    } else {
      // Browser doesn't support Geolocation
      this.editUserLocationMarker(true)
    }
  }

  handleCenterChanged = () => {
    this.setState({
      center: this._map.getCenter()
    });
  }

  handleZoomChanged = () => {
    this.setState({
      zoom: this._map.getZoom()
    });
  }

  handleSearchBoxMounted = (searchBox) => {
    this._searchBox = searchBox;
    this._searchBox._inputElement.setAttribute('placeholder', 'Set location...');
  }

  handlePlacesChanged = () => {
    const places = this._searchBox.getPlaces();
    let remainingColors = this.state.remainingColors;
    if (!places.length) {
      this.setState({
        isSnackbarActive: true,
        snackbarText: (
          <div>
            No results found
            <i className="material-icons">sentiment_very_dissatisfied</i>
          </div>
        )
      });
      return false;
    }

    // means that we are using the search to set the user location
    if(!this.state.userLocationMarker.length > 0) {
      this.redoSearchesInNewLocation(places[0], () => {
        this.setUserLocationMarker(places[0]);
      });
      return false;
    }

    let limit = Number(this.state.resultLimit);

    const filteredPlaces = places.filter((value, index) => {
      return index < limit;
    });

    let iconColor = remainingColors.shift();
    // Add a marker for each place returned from search bar
    const markers = filteredPlaces.map(place => ({
      position: place.geometry.location,
      iconColor,
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
      remainingColors
    }));

    // no more colors left to use!
    if (this.state.remainingColors.length === 0) {
      this.setState({
        isSnackbarActive: true,
        snackbarText: (
          <div>
            Max Searches Reached!
            <i className="material-icons">warning</i>
          </div>
        )
      });
    }

    this._searchBox._inputElement.value = '';
    this._searchBox._inputElement.blur();
    this.setBounds();
  }

  handleMarkerDelete = (targetMarker) => {
    let remainingColors = this.state.remainingColors;
    const results = this.state.results.filter((result, index) => {
      if (result.color === targetMarker.iconColor) {
        result.markers = result.markers.filter(marker => marker !== targetMarker);
        if (result.markers.length) {
          return result;
        } else {
          remainingColors.unshift(result.color);
          return false;
        }
      } else {
        return result;
      }
    });

    this.setState(prevState => ({
      results,
      remainingColors
    }));

    this.setBounds();
  }

  handleMarkerKeep = (targetMarker) => {
    const nextResults = this.state.results.map(result => {
      if (result.color === targetMarker.iconColor) {
        result.markers = result.markers.filter(marker => marker === targetMarker);
      }
      return result;
    });

    this.setState({
      results: nextResults
    });

    this.setBounds();
  }

  handleMarkerClick = (targetMarker, isUserLocationMarker) => {
    if (isUserLocationMarker) {
      if(targetMarker.isTemp) {
        this.setState(prevState => ({
          center: targetMarker.position
        }));
      } else {
        this.zoomToUserLocation();
      }
    } else {
      this.setState(prevState => ({
        userLocationMarker: [prevState.userLocationMarker[0]],
        results: prevState.results.map(result => {
          result.markers = result.markers.map(marker => {
            if (marker === targetMarker) {
              return {
                ...marker,
                showInfo: true,
              };
            }
            return {
              ...marker,
              showInfo: false,
            };
          });
          return result;
        })
      }));
    }
  }

  handleMarkerClose = (targetMarker) => {
    if(targetMarker.isTemp) {
      this.setState(prevState => ({
        userLocationMarker: [prevState.userLocationMarker[0]]
      }));
      return false;
    }
    this.setState({
      results: this.state.results.map(result => {
        if (result.color === targetMarker.iconColor) {
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

  handleColorBlindMode = (event) => {
    this.setState({ colorBlindMode: event.target.checked });
  }

  handleNightMode = (event) => {
    this.setState({ nightMode: event.target.checked });
  }

  handleTimeoutSnackbar = () => {
    this.setState({ isSnackbarActive: false });
  }

  handleOpenModal = () => {
    this.setState({ openModal: true });
  }

  handleCloseModal = () => {
    this.setState({ openModal: false });
  }

  handleHideWelcome = (event) => {
    if (storageAvailable('localStorage')) {
      localStorage.setItem('hideWelcome', event.target.checked);
    }
    this.setState({ hideWelcome: event.target.checked });
  }

  render() {
    const { results, resultLimit, zoom, center, userLocationMarker, bounds, searchBounds, isSnackbarActive, snackbarText, redoSearch, colorBlindMode, isLoading, initLocation, openModal, hideWelcome, nightMode } = this.state;
    let showRedoSearch = userLocationMarker.length < 1 && results.length > 0;
    let loadingClassName = isLoading ? 'active' : '';
    let maxSearchesClassName = results.length === MAX_SEARCH ? 'max-searches' : '';
    return (
      <div className={maxSearchesClassName}>
        <div id="loading-overlay" className={loadingClassName}>
          <Spinner />
        </div>
        {showRedoSearch &&
          <div className="redo-search">
            <RedoSearchRadio onChange={this.handleRedoSearch} value={redoSearch}/>
          </div>
        }
        <Layout>
          <Drawer>
            <Sidebar
              results={results}
              resultLimit={resultLimit}
              onResultLimitChange={this.handleResultLimitChange}
              onResultClick={this.setBounds}
              onResultDelete={this.handleResultDelete}
              onMarkerClick={this.handleMarkerClick}
              onMarkerDelete={this.handleMarkerDelete}
              onColorBlindModeChange={this.handleColorBlindMode}
              nightMode={nightMode}
              onNightModeChange={this.handleNightMode}
              colorBlindMode={colorBlindMode}
            />
          </Drawer>
          <Content className={this.state.nightMode ? 'night-mode' : ''}>
            <GoogleMapComponent
              containerElement={
                <div style={{ height: `100%` }} />
              }
              mapElement={
                <div style={{ height: `100%` }} />
              }
              results={results}
              zoom={zoom}
              center={center}
              nightMode={nightMode ? NIGHT_MODE : []}
              onMapLoad={this.handleMapMounted}
              onZoomChanged={this.handleZoomChanged}
              onCenterChanged={this.handleCenterChanged}
              userLocationMarker={userLocationMarker}
              onMarkerDelete={this.handleMarkerDelete}
              onMarkerKeep={this.handleMarkerKeep}
              onMarkerClick={this.handleMarkerClick}
              initLocation={initLocation}
              onSearchBoxMounted={this.handleSearchBoxMounted}
              onPlacesChanged={this.handlePlacesChanged}
              bounds={bounds}
              searchBounds={searchBounds}
              onMarkerClose={this.handleMarkerClose}
              onMapClick={this.handleMapClick}
              onNewLocationKeep={this.handleNewLocationKeep}
              redoSearch={redoSearch}
              handleRedoSearch={this.handleRedoSearch}
              colorBlindMode={colorBlindMode}
            />
            <EditButtons
            onHomeClick={this.zoomToUserLocation}
            onEditLocationClick={this.editUserLocationMarker}
            onMoreInfoClick={this.handleOpenModal}
            />
          </Content>
          <Snackbar
            active={isSnackbarActive}
            onTimeout={this.handleTimeoutSnackbar}>
            {snackbarText}
          </Snackbar>
          <ReactModal
            isOpen={openModal}
            closeTimeoutMS={0}
            overlayClassName="overlay"
            className="modal-content"
            contentLabel="Welcome to Irinamaps!"
            shouldCloseOnOverlayClick={true}
            role="dialog"
            parentSelector={() => document.body}>
            <h1>Welcome to Irinamaps<img src="/favicon-32x32.png" width="32" height="32" alt="Irinamaps"/></h1>
            <p>The easy way to display multiple search results on one map!</p>
            <div className="text-right">
              <div id="welcome-toggle-wrap">
                <Checkbox label="Don't Show Again" checked={hideWelcome} onChange={this.handleHideWelcome} />
              </div>
              <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect btn" onClick={this.handleCloseModal}>GOT IT!</button>
            </div>
          </ReactModal>
        </Layout>
      </div>
    );
  }
}
