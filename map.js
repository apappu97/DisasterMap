var exports = module.exports = {};
var map;
var centerCoords = {lat: 37.090, lng: -95.712};

function create_map(){
	return new google.maps.Map(document.getElementById('map'), {
    center:  centerCoords,
    zoom: 8
  });
}

function init() {
  map = create_map();
  var contentString = '<div id = "content"> <p> "hello world" </p> </div>';
  addMarker(centerCoords, contentString);
}

exports.addressToCoordinates = function(address) {
    address = address.split(" ").join("+");
    return address;
    //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyB1zP1yILbaQTz49V7BnkUIqMHXTmwtxp0
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