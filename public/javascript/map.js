var map;
var prevMarkerNumber = 0;

function create_map(lat, lng){
	var centerCoords = {lat, lng}
  return new google.maps.Map(document.getElementById('map'), {
    center:  centerCoords,
    zoom: 3
  });
}

function initMap() {
  console.log("init Map entered");
  var request = new XMLHttpRequest();
  request.open('GET', '/data');
  request.addEventListener('load', function(){
    if(request.status === 200){
      var coordinateData = JSON.parse(request.responseText);
      if(coordinateData.length !== prevMarkerNumber){
        // remake Map
        map = create_map(coordinateData[0].latitude, coordinateData[0].longitude);
        coordinateData.forEach(function(eachPerson){
          addMarker(eachPerson);
        });
        prevMarkerNumber = coordinateData.length;
      }
    }
    setTimeout(initMap, 10000);
  });
  request.send();
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