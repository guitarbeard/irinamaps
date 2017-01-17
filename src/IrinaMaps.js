/* global google */
import {
  default as React,
  Component,
} from 'react';

import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

import { Layout, Drawer, Content } from 'react-mdl';

import SearchBox from './SearchBox';
import Sidebar from './Sidebar';

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
    {props.markers.map((marker, index) => (
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

export default class IrinaMaps extends Component {

  constructor(props) {
    super(props);
    this.state = {
      placeholder: 'Set location...',
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
      usedColors: [],
      resultLimit: 10,
      results: []
    }
  }

  handleMapMounted = this.handleMapMounted.bind(this);
  handleBoundsChanged = this.handleBoundsChanged.bind(this);
  handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
  handlePlacesChanged = this.handlePlacesChanged.bind(this);
  handleMarkerClick = this.handleMarkerClick.bind(this);
  handleResultLimitChange = this.handleResultLimitChange.bind(this);
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
    }
  }

  handleMapMounted(map) {
    this._map = map;
  }

  handleBoundsChanged() {
    this.setState({
      bounds: this._map.getBounds(),
      center: this._map.getCenter(),
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
      markers: nextMarkers,
    });
  }

  render() {
    return (
      <div style={{height: `100%`}}>
        <Layout>
          <SearchBox placeholder={this.state.placeholder} />
          <Drawer>
            <Sidebar results={this.state.results} resultLimit={this.state.resultLimit} handleResultLimitChange={this.handleResultLimitChange} />
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
              onSearchBoxMounted={this.handleSearchBoxMounted}
              bounds={this.state.bounds}
              onPlacesChanged={this.handlePlacesChanged}
              markers={this.state.markers}
              onMarkerClick={this.handleMarkerClick}
            />
          </Content>
        </Layout>
      </div>
    );
  }
}
