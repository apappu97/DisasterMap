var map;
//var centerCoords = {lat: 37.090, lng: -95.712};

function create_map(lat, lng){
	var centerCoords = {lat, lng}
  return new google.maps.Map(document.getElementById('map'), {
    center:  centerCoords,
    zoom: 8
  });
}

function init(lat, lng, coordinatesArray) {
  map = create_map(lat, lng); // centers at an arbitrary lat and lng
  for(var i = 0; i < coordinatesArray.length; i+=3){
    var lat = coordinatesArray[i];
    var lng = coordinatesArray[i+1];
    var status = coordinatesArray[i+2];
    var coordinates = {lat, lng};
    addMarker(coordinates, status)
  }
}

function addMarker(coordinates, contentBody){

    var infowindow = new google.maps.InfoWindow({
      content: contentBody
    });

    var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
    });

    marker.addListener('click', function(){
      infowindow.open(map, marker);
    });
}