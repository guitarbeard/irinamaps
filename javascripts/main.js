// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
var colorArray = ['#7BB5E1', '#8379A7', '#2B9A77', '#C758A5', '#CFB587', '#FDDC00', '#F35962', '#FF7636', '#810969', '#0065BA'],
allMarkers = [],
selectedArea = null,
userLocationMarker = null;
function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var defaultLocation = {lat: 33.682, lng: -117.890};
  var map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  });

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });
  drawingManager.setMap(map);

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var marker = new google.maps.Marker({
        map: map,
        position: pos,
        animation: google.maps.Animation.DROP,
        zIndex: google.maps.Marker.MAX_ZINDEX + 1
      });

      marker.addListener('click', function() {
        map.setZoom(15);
        map.setCenter(pos);
      });

      userLocationMarker = marker;
      map.setCenter(pos);
      setMap();
    }, function() {
      var userLocationSearchBox = new google.maps.places.SearchBox(input);
      var userLocationSearchBoxEvent = userLocationSearchBox.addListener('places_changed', function() {
        var places = userLocationSearchBox.getPlaces();
        if (places.length == 0) {
          return;
        }

        var marker = new google.maps.Marker({
          map: map,
          position: places[0].geometry.location,
          animation: google.maps.Animation.DROP,
          zIndex: google.maps.Marker.MAX_ZINDEX + 1
        });

        marker.addListener('click', function() {
          map.setZoom(15);
          map.setCenter(places[0].geometry.location);
        });

        map.setCenter(places[0].geometry.location);
        userLocationMarker = marker;
        setMap();
      });
    });

  } else {
    // Browser doesn't support Geolocation
    var userLocationSearchBox = new google.maps.places.SearchBox(input);
    var userLocationSearchBoxEvent = userLocationSearchBox.addListener('places_changed', function() {
      var places = userLocationSearchBox.getPlaces();
      if (places.length == 0) {
        return;
      }

      var marker = new google.maps.Marker({
        map: map,
        position: places[0].geometry.location,
        animation: google.maps.Animation.DROP,
        zIndex: google.maps.Marker.MAX_ZINDEX + 1
      });

      marker.addListener('click', function() {
        map.setZoom(15);
        map.setCenter(places[0].geometry.location);
      });

      map.setCenter(places[0].geometry.location);
      userLocationMarker = marker;
      setMap();
    });
  }

  function setMap(){
    google.maps.event.clearInstanceListeners(input);

    input.setAttribute("style", "");
    input.setAttribute("placeholder", "Search...");
    input.value = "";
    var searchBoxOptions = {
      bounds: new google.maps.Circle({center: userLocationMarker.getPosition(), radius: 30}).getBounds()
    };

    var resultLimitInput = document.getElementById('result-limit-num'),
    searchBox = new google.maps.places.SearchBox(input, searchBoxOptions),
    infowindow = new google.maps.InfoWindow();

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    // map.addListener('bounds_changed', function() {
    //   searchBox.setBounds(map.getBounds());
    // });

    map.addListener('click', function() {
      infowindow.close();
    });

    // DRAWING!
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      if(selectedArea){
        selectedArea.setMap(null);
        selectedArea = null;
      }
      selectedArea = polygon;
      checkAllMarkersAgainstSelectedArea();

      google.maps.event.addListener(selectedArea, 'click', function(event) {
        selectedArea.setMap(null);
        selectedArea = null;
        checkAllMarkersAgainstSelectedArea();
      });
    });

    function checkAllMarkersAgainstSelectedArea(){
      for (var i = 0; i < allMarkers.length; i++) {
        var marker = allMarkers[i];
        var resultColor = marker.resultColor;
        if(selectedArea)
          resultColor = google.maps.geometry.poly.containsLocation(marker.getPosition(), selectedArea) ? resultColor : 'rgba(0,0,0,.15)';

        var icon = marker.getIcon();
        icon.fillColor = resultColor;
        marker.setIcon(icon);
      }
    };

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      resultLimitInput.value = Math.round(resultLimitInput.value);
      if (places.length == 0) {
        return;
      }

      // create result
      var searchTerm = input.value,
      color = getRandomColor(),
      results = places.length === 1 ? '' : places.length >= resultLimitInput.value ? '<div class="result-amount">' + resultLimitInput.value +' results</div>' : '<div class="result-amount">' + places.length +' results</div>';

      var result = createResult({
        content: '<div class="result-text">' + searchTerm + results + '</div><button class="remove-result" type="button">×</button>',
        color: color,
        markers: []
      });
      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place, index) {
        if(index >= resultLimitInput.value)
          return false;

        var resultColor = color;
        if(selectedArea)
          resultColor = google.maps.geometry.poly.containsLocation(place.geometry.location, selectedArea) ? color : 'rgba(0,0,0,.15)';

        var icon = {
          path: "M19.39,1.562c-2.505-1.238-5.94-0.477-8.377,1.643C8.576,1.085,5.141,0.323,2.636,1.562 C-0.357,3.039-0.88,6.782,1.474,9.924l1.962,2.065l0.402,0.425l7.174,7.56l7.174-7.56l0.402-0.425l1.963-2.065 C22.906,6.782,22.383,3.039,19.39,1.562z",
          fillColor: resultColor,
          strokeColor: '#fff',
          fillOpacity: 1,
          strokeOpacity: .5,
          anchor: new google.maps.Point(11, 11)
        };

        // Create a marker for each place.
        var marker = new google.maps.Marker({
          map: map,
          title: place.name,
          position: place.geometry.location,
          resultColor: color,
          icon: icon,
          animation: google.maps.Animation.DROP
        });

        var open_now_html = "";
        if(place.opening_hours)
          open_now_html = place.opening_hours.open_now ? "<p class='openNow'>Open meow!</p>" : "<p class='closedNow'>closed :(</p>";

        var removeId = "remove" + Date.now();
        var removeHtml = "<button id='" + removeId + "' type='button' class='btn btn-danger btn-xs remove-single-result'>remove</button>";

        marker.addListener('click', function() {
          infowindow.setContent("<div class='infoWindow'>" + place.name + removeHtml + "<br>" + open_now_html +  "</div>");
          infowindow.open(map, marker);
          var removeBtn = document.getElementById(removeId);
          google.maps.event.addDomListener(removeBtn, "click", function(event){
            event.preventDefault();
            marker.setMap(null);
          });
          google.maps.event.addDomListener(removeBtn, "touchend", function(event){
            event.stopPropagation();
            marker.setMap(null);
          });
        });

        allMarkers.push(marker);
        result.markers.push(marker);

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      // resize only if bounds are not in viewport
      if(!map.getBounds().contains(bounds.getCenter()))
        map.fitBounds(bounds);

      input.value = "";
    });
  }
}

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getRandomColor() {
  var color = colorArray.splice(randomIntFromInterval(0, colorArray.length - 1), 1);
  return color[0];
};

function createResult(result){
  var resultsWrap = document.getElementById('results-wrap'),
  resultElement = document.createElement("div");
  resultElement.className = "result";
  resultElement.innerHTML = result.content;
  resultElement.style.background = result.color;

  function checkColorArray () {
    if(colorArray.length === 0){
      document.body.setAttribute('full', true);
    }else{
      document.body.setAttribute('full', false);
    }
  };

  checkColorArray();

  function removeResult (event) {
    event.preventDefault();
    result.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    resultElement.parentNode.removeChild(resultElement);
    resultElement = null;
    if(result.color !== undefined)
      colorArray.push(result.color);

    checkColorArray();
  };

  var removeBtn = resultElement.getElementsByClassName("remove-result")[0];
  removeBtn.addEventListener("click", removeResult);
  removeBtn.addEventListener("touchend", removeResult);

  // Prepend it to the parent element
  resultsWrap.insertBefore(resultElement, resultsWrap.firstChild);

  return result;
};
