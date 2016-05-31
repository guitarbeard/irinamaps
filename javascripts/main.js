// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
var colorArray = [
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
map,
allMarkers = {},
allResults = [],
userLocationMarker = null,
notification;

function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var defaultLocation = {lat: 33.690, lng: -117.887};
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    disableDefaultUI: true,
    zoomControl: true
  });


  var takeMeHomeButton = document.getElementById('take-me-home'),
  editHomeButton = document.getElementById('edit-home'),
  toggleResultsButton = document.getElementById('toggle-results')
  resultLimitInput = document.getElementById('result-limit-num'),
  infowindow = new google.maps.InfoWindow(),
  placesService = new google.maps.places.PlacesService(map),
  notification = document.querySelector('.mdl-js-snackbar');

  google.maps.event.addDomListener(takeMeHomeButton, "click", function(event){
    map.setZoom(15);
    map.setCenter(userLocationMarker.getPosition());
  });

  google.maps.event.addDomListener(editHomeButton, "click", function(event){
    setLocationSearchbox();
  });

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
        zIndex: google.maps.Marker.MAX_ZINDEX + 1,
        optimized: false
      });

      marker.addListener('click', function() {
        map.setZoom(15);
        map.setCenter(pos);
      });

      userLocationMarker = marker;
      map.setCenter(pos);
      setMap();
    }, function() {
      setLocationSearchbox();
    });

  } else {
    // Browser doesn't support Geolocation
    setLocationSearchbox();
  }

  function redoSearchResults() {
    if(!allResults.length)
      return false;

    var resultLimitInput = document.getElementById('result-limit-num');
    if(resultLimitInput.value === 0)
      resultLimitInput.value = 1;

    function redoResultSearch(index) {
      var result = allResults[index];
      result.markers.forEach(function(marker) {
        marker.setMap(null);
        delete allMarkers[marker.id];
      });
      result.places = [];
      result.markers = [];
      // redo search with result.searchTerm, then addMarkersToMap
      var request = {
        location: userLocationMarker.getPosition(),
        radius: '30',
        query: result.searchTerm
      };

      placesService.textSearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          result.places = results;
          var resultText = result.places.length === 1 || resultLimitInput.value === 1 ? '' : result.places.length >= resultLimitInput.value ? '<div class="result-amount">' + resultLimitInput.value +' results</div>' : '<div class="result-amount">' + result.places.length +' results</div>';
          document.getElementById(result.id).innerHTML = result.searchTerm + resultText;
          addMarkersToMap(result.places, result, resultLimitInput, result.color);
        }
        // check if last result, else run again
        if(index === allResults.length - 1){
          var bounds = new google.maps.LatLngBounds();
          for (var i in allMarkers) {
            bounds.extend(allMarkers[i].getPosition());
          }
          bounds.extend(userLocationMarker.getPosition());
          map.fitBounds(bounds);
        }else{
          redoResultSearch(index + 1);
        }
      });
    }
    redoResultSearch(0);
  }

  function setLocationSearchbox() {
    document.body.setAttribute('location-set', false);
    document.body.setAttribute('full', false);
    google.maps.event.clearInstanceListeners(input);
    input.setAttribute("placeholder", "Set location...");
    input.setAttribute("style", "");
    input.value = "";
    input.focus();
    if(userLocationMarker)
      userLocationMarker.setMap(null);
    userLocationMarker = null;
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
        zIndex: google.maps.Marker.MAX_ZINDEX + 1,
        optimized: false
      });

      marker.addListener('click', function() {
        map.setZoom(15);
        map.setCenter(places[0].geometry.location);
      });

      map.setCenter(places[0].geometry.location);
      userLocationMarker = marker;
      setMap();
      // redo past searches
      redoSearchResults();
    });
  }

  function addMarkersToMap(places, result, resultLimitInput, color) {
    places.forEach(function(place, index) {
      if(index < resultLimitInput.value){

        var resultColor = color;

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
          id: place.place_id,
          map: map,
          title: place.name,
          position: place.geometry.location,
          resultColor: color,
          icon: icon,
          animation: google.maps.Animation.DROP
        });

        marker.addListener('click', function() {
          var request = {
            placeId: place.place_id
          };

          placesService.getDetails(request, detailCallback);

          function detailCallback(placeDetail, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              place = placeDetail;
            }
            infowindow.setContent("<div class='infoWindow'>" + buildInfoWindowHtml(place) +  "</div>");
            infowindow.open(map, marker);
            var removeBtn = document.getElementById('remove' + place.place_id);
            google.maps.event.addDomListener(removeBtn, "click", function(event){
              event.preventDefault();
              marker.setMap(null);
              delete allMarkers[marker.id];
            });
            google.maps.event.addDomListener(removeBtn, "touchend", function(event){
              event.stopPropagation();
              marker.setMap(null);
              delete allMarkers[marker.id];
            });
          }
        });

        allMarkers[marker.id] = marker;
        result.markers.push(marker);
      }
    });
  };

  function setMap(){
    document.body.setAttribute('location-set', true);
    google.maps.event.clearInstanceListeners(input);
    input.setAttribute("placeholder", "Search...");
    input.setAttribute("style", "");
    input.value = "";
    input.focus();

    var searchBoxOptions = {
      bounds: new google.maps.Circle({center: userLocationMarker.getPosition(), radius: 30}).getBounds()
    };
    var searchBox = new google.maps.places.SearchBox(input, searchBoxOptions);
    input.setAttribute("style", "");
    map.addListener('click', function() {
      input.blur();
      infowindow.close();
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      resultLimitInput.value = Math.round(resultLimitInput.value);
      if(resultLimitInput.value === 0)
        resultLimitInput.value = 1;

      if (places.length === 0) {
        notification.MaterialSnackbar.showSnackbar(
          {
            message: 'No results found :('
          }
        );
        return false;
      }

      // create result
      var searchTerm = input.value,
      color = getRandomColor(),
      results = places.length === 1 ? '' : places.length >= resultLimitInput.value ? '<div class="result-amount">' + resultLimitInput.value +' results</div>' : '<div class="result-amount">' + places.length +' results</div>',
      resultId = 'result'+Date.now();

      var result = createResult({
        id: resultId,
        searchTerm: searchTerm,
        content: '<button id="'+resultId+'" class="result-text mdl-list__item-primary-content mdl-button mdl-js-button">' + searchTerm + results + '</button><span clas="mdl-list__item-secondary-content"><button class="mdl-button mdl-js-button mdl-button--icon remove-result"><i class="material-icons">clear</i></button></span>',
        color: color,
        markers: [],
        places: places
      });

      var bounds = new google.maps.LatLngBounds();

      addMarkersToMap(places, result, resultLimitInput, color);

      for (var i in allMarkers) {
        bounds.extend(allMarkers[i].getPosition());
      }
      bounds.extend(userLocationMarker.getPosition());
      map.fitBounds(bounds);
      input.value = "";
    });
  }
}

function buildInfoWindowHtml(place) {
  var photo = "";
  if(place.photos){
    var src = place.photos[0].getUrl({'maxHeight': 500, 'maxWidth': 500});
    photo = "<div class='place-img' style='background-image:url("+src+");'></div><span class='attribution'>" + place.photos[0].html_attributions[0] + "</span><br>";
  }

  var name = "<strong>" + place.name + "</strong>";

  var remove = "<button id='remove" + place.place_id + "' type='button' class='btn btn-danger btn-xs remove-single-result'>remove</button>";

  var address = "";
  for (var i = 0; i < place.address_components.length; i++) {
    if(i === 0)
      address += "<br>";
    if(place.address_components[i].types[0] === "locality"){
      if(i !== 0)
        address += "<br>";
      address += place.address_components[i].short_name + ", ";
    }else if(place.address_components[i].types[0] !== "country" && place.address_components[i].types[0] !== "administrative_area_level_3" && place.address_components[i].types[0] !== "administrative_area_level_2"){
      address += place.address_components[i].short_name + " ";
    }
  }

  var phone = "";
  if(place.formatted_phone_number)
    phone = "<br><a href='tel:" + place.formatted_phone_number + "'>" + place.formatted_phone_number + "</a>";

  var website = "";
  if(place.website){
    website = "<br><a class='website' href='" + place.website + "' target='_blank'>" + place.website + "</a>";
  }

  var open_now = "";
  if(place.opening_hours)
    open_now = place.opening_hours.open_now ? "<br><span class='openNow'>Open meow!</span>" : "<br><span class='closedNow'>closed :(</span>";

  var directions_link = '<br><a class="btn btn-default btn-block btn-small directions_btn" href="'+place.url+'" target="_blank">Get Directions</a>'

  return photo + name + remove + address + phone + website + open_now + directions_link;
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
  resultElement = document.createElement('li');
  resultElement.classList.add('result','mdl-list__item','mdl-list__item--two-line');
  resultElement.innerHTML = result.content;
  resultElement.style.background = result.color;

  function checkColorArray () {
    if(colorArray.length === 0){
      document.body.setAttribute('full', true);
      notification.MaterialSnackbar.showSnackbar(
        {
          message: 'Max searches reached!'
        }
      );
    }else{
      document.body.setAttribute('full', false);
    }
  };

  checkColorArray();
  allResults.push(result);

  function removeResult (event) {
    event.preventDefault();
    result.markers.forEach(function(marker) {
      marker.setMap(null);
      delete allMarkers[marker.id];
    });
    allResults.splice(allResults.indexOf(result), 1);
    resultElement.parentNode.removeChild(resultElement);
    resultElement = null;
    if(result.color !== undefined)
      colorArray.push(result.color);

    checkColorArray();
  };

  function focusResult (event) {
    event.preventDefault();
    var bounds = new google.maps.LatLngBounds();

    result.markers.forEach(function(marker) {
      bounds.extend(marker.getPosition());
    });

    bounds.extend(userLocationMarker.getPosition());
    map.fitBounds(bounds);
  };

  var removeBtn = resultElement.getElementsByClassName("remove-result")[0];
  removeBtn.addEventListener("click", removeResult);
  removeBtn.addEventListener("touchend", removeResult);

  var resultElementText = resultElement.getElementsByClassName("result-text")[0];
  resultElementText.addEventListener("click", focusResult);
  resultElementText.addEventListener("touchend", focusResult);

  // Prepend it to the parent element
  resultsWrap.insertBefore(resultElement, resultsWrap.firstChild);

  return result;
};
