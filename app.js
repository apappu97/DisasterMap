
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var unirest = require('unirest');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var os = require('os');
var S = require('string');
var map = require('./map.js');
var async = require('async');
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
    var twilio = require('twilio');
    var twiml = new twilio.TwimlResponse();
  var cookie = req.body.cookies;
  var addr = "";
  var status = "";
  var finalstring = req.body.Body;
  addr = S(finalstring).between('ADDRESS: ', 'STATUS: ').s;
  status = S(finalstring).between('STATUS:').s;
    if (addr == "" || status == "") {
        twiml.message("That doesn't follow the format of:" +
            os.EOL + "ADDRESS:"+ os.EOL + "STATUS:" + os.EOL + "Please try again");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
    }
  var address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addr.split(" ").join("+") + "&key=AIzaSyChCIMnLJFcujELe5FdvrAKuYCMG9IJJDc";
  var lat;
  var lng;
  unirest.get(address, lat)
      .end(function (response, lat) {
          if (response.body.results.length == 0) {
              twiml.message("We couldn't find that location. Try again, with the format:" +
                  os.EOL + "ADDRESS:"+ os.EOL + "STATUS:");
              res.writeHead(200, {'Content-Type': 'text/xml'});
              res.end(twiml.toString());
              return;
          }
        lat = response.body.results[0].geometry.location.lat;

        unirest.get(address, lng)
            .end(function (response, lng) {
              lng = response.body.results[0].geometry.location.lng;
              twiml.message("We received your request. You inputed your address as:" + os.EOL
                  + addr + os.EOL + "and your status as:" + os.EOL + status + ". Your coordinates are: " + lat + ", " + lng);
              res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            });
      });
});

app.listen(8080, function() {
  twilio.messages.create({
    body: "This is a message from your local nonprofit. Please send us your address and needs in the following format."+ os.EOL +
    "ADDRESS:"+ os.EOL + "STATUS:",
    to: "+15094329908",
    from: "+12108800132"
  }, function(err, message) {
    process.stdout.write(message.sid);
  });
});

module.exports = app;
