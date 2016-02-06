var request = require('request');
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
    address = "https://maps.googleapis.com/maps/api/geocode/json?" + address.split(" ").join("+") + "&key=AIzaSyB1zP1yILbaQTz49V7BnkUIqMHXTmwtxp0";
    request(address, function(error, response, body){
       if (!error && response.statusCode == 200) {
           console.log("Lat: " + body.results.geometry.location.lat);
           console.log("Lon: " + body.results.geometry.location.lng);
       }
    });
    return address;
};

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