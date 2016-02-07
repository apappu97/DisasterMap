var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var os = require('os');
var S = require('string');
var map = require('./map.js')
var app = express();


var accountSid = 'AC2a8b15d166303da6d57a97dcc25f3b3e';
var authToken = "0f73d916916b73a1786aee7c951df1a8";
var twilio = require('twilio')(accountSid, authToken);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/sms', function(req, res) {
  var cookie = req.body.cookies;
  var addr = "";
  var status = "";
  var finalstring = req.body.Body;
  addr = S(finalstring).between('ADDRESS: ', 'STATUS: ').s;
  status = S(finalstring).between('STATUS:').s;
  console.log("Address " + addr);
  console.log("Status " + status);
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();
  var lat = addressToCoordinatesLat(addr);
  console.log(lat);
  var lng = addressToCoordinatesLng(addr);
  console.log(lng);
  twiml.message("We received your request. You inputed your address as:" + os.EOL
  + addr + os.EOL + "and your status as:" + os.EOL + status + ". Your lng is: " + lng + " and your lat is: " + lat);
  res.writeHead(200, {'Content-Type': 'text/xml'});

  res.end(twiml.toString());
});

app.listen(8080, function() {
  twilio.messages.create({
    body: "This is a message from your local nonprofit. Please send us your address and needs in the following format."+ os.EOL +
    "ADDRESS:"+ os.EOL + "STATUS:",
    to: "+12102683553",
    from: "+12108800132"
  }, function(err, message) {
    process.stdout.write(message.sid);
  });
});

addressToCoordinatesLat = function(address) {
  address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address.split(" ").join("+") + "&key=AIzaSyChCIMnLJFcujELe5FdvrAKuYCMG9IJJDc";
  request(address, function(error, response, body){
    if (!error && response.statusCode == 200) {
      return body.results[0].geometry.location.lat;
    } else {
      console.log(error);
    }
  })
};

addressToCoordinatesLng = function(address) {
  address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address.split(" ").join("+") + "&key=AIzaSyChCIMnLJFcujELe5FdvrAKuYCMG9IJJDc";
  request(address, function(error, response, body){
    if (!error && response.statusCode == 200) {
      return body.results[0].geometry.location.lng;
    } else {
      console.log(error);
    }
  })
};
module.exports = app;
