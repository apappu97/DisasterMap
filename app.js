require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var unirest = require('unirest');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var Person = require('./models/location');
mongoose.connect('mongodb://heroku_h1mbknwv:s8d03rgc20qjhls0kh2ep66em@ds049848.mongolab.com:49848/heroku_h1mbknwv');

var os = require('os');
var S = require('string');
var app = express();


var accountSid = 'AC2a8b15d166303da6d57a97dcc25f3b3e';
var authToken = "0f73d916916b73a1786aee7c951df1a8";
var twilio = require('twilio')(accountSid, authToken);

//var coordinates = [];

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


app.get('/', function(req, res){
  res.render('/public/index.html');
});

app.post('/sms', function(req, res) {
    console.log("we received a text from: " + req.body.From);
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();
  var addr = "";
  var status = "";
  var finalstring = req.body.Body;
  addr = S(finalstring.toUpperCase()).between('ADDRESS: ', 'STATUS: ').humanize().s;
  status = S(finalstring.toUpperCase()).between('STATUS:').humanize().s;
    if (addr == "" || status == "") {
        twiml.message("That doesn't follow the format of:" +
            os.EOL + "ADDRESS:"+ os.EOL + "STATUS:" + os.EOL + "Please try again");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
    }
  var address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addr.split(" ").join("+") + "&key=AIzaSyChCIMnLJFcujELe5FdvrAKuYCMG9IJJDc";
  // THESE STORE THE LATITUDE AND LONGITUDE
  var lat = 0;
  var lng = 0;
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
        console.log("Typeof lat;" + typeof(lat));
        unirest.get(address, lng)
            .end(function (response, lng) {
              lng = response.body.results[0].geometry.location.lng;
              twiml.message("We received your request. You inputed your address as:" + os.EOL
                  + addr + os.EOL + "and your status as:" + os.EOL + status + os.EOL +". Your coordinates are: " + lat + ", " + lng + ". Your pin has been dropped on the global map!");
              console.log("Typeof LNG;" + typeof(lng));
                status += " (This status was sent from the number: " + req.body.From + ")";
                var person = new Person({
                latitude: lat,
                longitude: lng,
                contentBody: status
              });
              console.log(person);
              person.save(function(err){
                if(err) throw err;
                console.log('User saved successfully!');
              });
              res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            });
      });
});

app.get('/data', function(req, res){
    Person.find({}, function(err, markers) {
        var markerMap = [];
        markers.forEach(function(marker) {
            markerMap.push(marker);
        });
        var dataJSON = JSON.stringify(markerMap);
        console.log("datajason " + dataJSON);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(dataJSON);
    });
});


app.post('/phone', function(req, res) {
    console.log("number " + req.body.number);
    var num = req.body.number;
    JSON.stringify(num);
    twilio.messages.create({
        to: num,
        from:"+12108800132",
        body:"This is a message from DisasterMap. Please send us your address and needs in the following format for your pin to be placed on the map."+ os.EOL +
        "ADDRESS:"+ os.EOL + "STATUS:" + os.EOL + "Here is an example response:" + os.EOL + "ADDRESS: 123 Main Street, New York City, New York, USA" + os.EOL + "STATUS: I need some water and food"
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);

            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end();

});
// init

// Initializes the server
app.listen(8080, function() {
  twilio.messages.create({
    body:"This is a message from DisasterMap. Please send us your address and needs in the following format for your pin to be placed on the map."+ os.EOL +
        "ADDRESS:"+ os.EOL + "STATUS:" + os.EOL + "Here is an example response:" + os.EOL + "ADDRESS: 123 Main Street, New York City, New York, USA" + os.EOL + "STATUS: I need some water and food",
    to: "+12102683553",
    from: "+12108800132"
  }, function(err, message) {
    process.stdout.write(message.sid);
  });
});
module.exports = app;
