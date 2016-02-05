var map,
	uk = {
		lat: 51.5224821,
		lng: -0.1389824
	},
	markers=[],
	position,
	infowindow,
	service,
  ukText = '<i class="material-icons">&#xE55C;</i>';
function CenterControl(controlDiv, map, text) {
	// Set CSS for the control border.
    var controlUI = document.createElement('div');
    // controlUI.addClass('control');

    var controlUI = document.createElement('div');
    controlUI.title = 'Center to your location';
    controlDiv.appendChild(controlUI);
    controlUI.className="location-outside";

    // Set CSS for the control interior.
   
		var controlText = document.createElement('div');
    controlText.innerHTML = text;
    controlUI.appendChild(controlText);
    controlText.className="location-inside";
    google.maps.event.addDomListener(controlUI, 'click', function() {
      geoLocation();
    });
}
function initialize(controlDiv) {
	var input = (document.getElementById('search'));
  map = new google.maps.Map(document.getElementById('map'), {
    center: uk,
    zoom: 16,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    }
  });
  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
	geoLocation();
  var centerControlDiv = document.createElement('div');
  centerControlDiv.className="control";
  var centerControl = new CenterControl(centerControlDiv, map, ukText, uk);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
}
// if geo location, locate
function geoLocation() {
	var image = {
	    url: "../images/marker.svg",
	    scaledSize: new google.maps.Size(32, 32),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(16, 32)
	  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var gpsPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // clearMap();
      map.setCenter(gpsPosition);
      map.setZoom(14);
      if (markers.length == 0) {
      	loadNearby(gpsPosition);
      }
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}
// geolocation error handler
function clearMap(){
	if (markers.length == 0) {
	  return;
	}else{	
		for (var i = 0, marker; marker = markers[i]; i++) {
		  marker.setMap(null);
		}
	  // markers = [];
	}
}
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: uk,
    content: content
  };
  map.setCenter(options.position);
}
function loadNearby(position){
	service.nearbySearch({
    location: position,
    radius: 5000,
    types: ['museum']
  }, callback);
}
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
	var image = {
	    url: "../images/marker.svg",
	    scaledSize: new google.maps.Size(32, 32),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(16, 32)
	};  
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    icon: image
  });
  markers.push(marker)
  // console.log(place)
  google.maps.event.addListener(marker, 'click', function() {
  	// console.log(place);
  	if (place.opening_hours == undefined) {
  		content = "<div><b>"+place.name+"</b></div> <i>Click here to add to schedule</i>"
  	} else if(place.opening_hours != undefined && place.opening_hours.open_now == true) {
  		content = "<div><b>"+place.name+"</b></div> Open now <i>Click here to add to schedule</i>"
  	} else {
  		content = "<div><b>"+place.name+"</b></div> Closed now <i>Click here to add to schedule</i>"
  	}
    infowindow.setContent(content);
    infowindow.open(map, this);
  });
  google.maps.event.addListener(marker, 'dblclick', function() {
  	addPlaceToBasket(place);
  });
}
google.maps.event.addDomListener(window, "load", initialize);