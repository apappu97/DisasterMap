var map;
//var centerCoords = {lat: 37.090, lng: -95.712};

function create_map(lat, lng){
	var centerCoords = {lat, lng}
  return new google.maps.Map(document.getElementById('map'), {
    center:  centerCoords,
    zoom: 8
  });
}

function initMap(eachPerson) {
  map = create_map(eachPerson.latitude, eachPerson.longitude); // centers at user's lat and lng
  // for(var i = 0; i < coordinatesArray.length; i+=3){
  //   var lat = coordinatesArray[i];
  //   var lng = coordinatesArray[i+1];
  //   var status = coordinatesArray[i+2];
  //   var coordinates = {lat, lng};
  //   addMarker(coordinates, status)
  // }
}

function addMarker(eachPerson){
    var lat = eachPerson.latitude;
    var lng = eachPerson.longitude;
    var coordinates = {lat, lng};
    var status = eachPerson.contentBody;

    var infowindow = new google.maps.InfoWindow({
      content: status
    });

    var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
    });

    marker.addListener('click', function(){
      infowindow.open(map, marker);
    });
}