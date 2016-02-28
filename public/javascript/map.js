var map;
var prevMarkerNumber = 0;

// Function to create google map
function create_map(lat, lng){
	var centerCoords = {lat, lng}
  return new google.maps.Map(document.getElementById('map'), {
    center:  centerCoords,
    zoom: 3
  });
}

// Obtains coordinate data from backend and re creates map
function initMap() {
  // Request for obtaining coordinate data for each person
  var request = new XMLHttpRequest();
  request.open('GET', '/data');
  request.addEventListener('load', function(){
    if(request.status === 200){
      var coordinateData = JSON.parse(request.responseText);
      if(coordinateData.length !== prevMarkerNumber){ // remake map, new users have been submitted
        map = create_map(coordinateData[0].latitude, coordinateData[0].longitude); //re-create map
        coordinateData.forEach(function(eachPerson){
          addMarker(eachPerson); // add new marker for each person 
        });
        prevMarkerNumber = coordinateData.length;
      }
    }
    setTimeout(initMap, 10000); // Re query database every 10 seconds
  });
  request.send();
}

// Adds marker to created map for person object passed in 
function addMarker(eachPerson){
    var lat = eachPerson.latitude;
    var lng = eachPerson.longitude;
    var coordinates = {lat, lng};
    var status = eachPerson.contentBody;

    // Sets info window that opens when marker is clicked on
    var infowindow = new google.maps.InfoWindow({
      content: status
    });

    // Creates and adds marker
    var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
    });

    // Infowindow opening capability
    marker.addListener('click', function(){
      infowindow.open(map, marker);
    });
}