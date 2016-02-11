var map,
	uk = {
		lat: 51.5224821,
		lng: -0.1389824
	},
	markers=[],
	markersSelected=[],
	position,
	bounds,
	hours = 0,
	infowindow,
	service,
  text = '<i class="material-icons">&#xE55C;</i>';
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
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
  var centerControl = new CenterControl(centerControlDiv, map, text);
  var input = document.getElementById('searchbar'); 
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
    changeRange();
  });

  google.maps.event.addListenerOnce(map, 'idle', function(){
      changeRange();
  }); 
  searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }
      clearMap();
      // For each place, get the icon, name and location.
      places.forEach(function(place) {
      	var position = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
        loadNearby(position);
        map.panTo(position);
        map.setZoom(14);
      });
    });
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
      map.panTo(gpsPosition);
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
	  markers = [];
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
    radius: 7000,
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
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    time: randomNum(1,9),
    title: place.name,
    id: place.id,
    checked: false,
    selected: false, 
    icon: image
  });
  markers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
  	if (place.opening_hours == undefined) {
  		content = "<div><b>"+place.name+"</b></div>"
  	} else if(place.opening_hours != undefined && place.opening_hours.open_now == true) {
  		content = "<div><b>"+place.name+"</b></div> Open now"
  	} else {
  		content = "<div><b>"+place.name+"</b></div> Closed now"
  	}
    infowindow.setContent(content);
    infowindow.open(map, this);
  });
  google.maps.event.addListener(marker, 'dblclick', function() {
  	// addThisToListFromMap(place);
  });
}
function randomNum(min, max){return Math.floor(Math.random() * (max - min)) + min;}
function changeRange(){
	var range = document.getElementById('range').value;
	document.getElementById('inner-hours').innerHTML = range+ " hours";
	filterMarkers(range, false);
}
function filterMarkers(range, clear){
	if (markers.length > 0) {
	$(".pick-container").empty();
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].time > range) {
				markers[i].setVisible(false);
			} else {
				markers[i].setVisible(true);
				if (clear) {
					fillChecklist(markers[i], true);
				} else {
					fillChecklist(markers[i], false);
				}
			}
		}
	}
}
function fillChecklist(marker, clear){
	var text;
	if (marker.title.length > 20 && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || $("body").width() < 650)) {
		marker.title = marker.title.substring(0,15) + "..."
	} else if (marker.title.length > 30) {
		marker.title = marker.title.substring(0,30) + "..."
	}
	if (marker.checked && !clear) {
		text = "<div class='option'><input onchange='addThisToList(this,event)' checked type='checkbox' id='"+marker.id+"' value='"+marker.time+"'><span class='title'>"+marker.title+"</span><span class='time'>Estimated time: "+marker.time+"</span></div>";
	} else {
		text = "<div class='option'><input onchange='addThisToList(this,event)' type='checkbox' id='"+marker.id+"' value='"+marker.time+"'><span class='title'>"+marker.title+"</span><span class='time'>Estimated time: "+marker.time+"</span></div>";
	}
	$(".pick-container").append(text);
}
function addThisToList(el,ev){
	console.log('test3');
	var imageBlue = {
	    url: "../images/marker-blue.svg",
	    scaledSize: new google.maps.Size(32, 32),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(16, 32)
	}; 
	var image = {
	    url: "../images/marker.svg",
	    scaledSize: new google.maps.Size(32, 32),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(16, 32)
	}; 
	var id = ev.target.id;
	var value = parseFloat(ev.srcElement.value);
	var range = document.getElementById('range').value;
	if (ev.srcElement.checked) {
		for (var i = 0; i < markers.length; i++) {
			if (id == markers[i].id){
				markers[i].checked = true;
				markers[i].setIcon(imageBlue);
				markers[i].selected = true;
				markersSelected.push(markers[i]);
				map.panTo(markers[i].position);
				google.maps.event.trigger(markers[i], 'click');
				break;
			} else if (markers[i].selected){
				markers[i].setIcon(imageBlue);
			} else{
				markers[i].setIcon(image);
			}
		}
		hours += value;
		if (hours >= range) {
			document.getElementById("result").innerHTML = "<div class='result-inner'> Please select less places or more hours</div>";
		}else{
			document.getElementById("result").innerHTML = "<div class='result-inner'> Total of hours: <b>"+hours+"</b></div>";
		}
	} else {
		for (var i = 0; i < markers.length; i++) {
			if (id == markers[i].id) {
				markers[i].checked = false;
				markers[i].setIcon(image);
				markersSelected.splice(i, 1);
			}
		}
		hours -= value;
		document.getElementById("result").innerHTML = "<div class='result-inner'> Total of hours: <b>"+hours+"</b></div>";
	}
}
function deleteAll(elem){
	var range = document.getElementById('range').value;
	markersSelected = [];
	for (var i = 0; i < markers.length; i++) {
		markers[i].checked = false;
	}
	filterMarkers(range, true);
}
google.maps.event.addDomListener(window, "load", initialize);