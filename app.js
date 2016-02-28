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
mongoose.connect(process.env.MONGOLAB_URI);
var os = require('os');
var S = require('string');
var app = express();

// API keys, etc.
var twilio = require('twilio')(process.env.accountSID, process.env.authToken);
var mapKey = process.env.mapKey;
//var coordinates = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Render home page
app.get('/', function(req, res){
  res.render('/public/index.html');
});

// Route for handling text messages from users - twilio API sends post request to designated route
app.post('/sms', function(req, res) {
    console.log("we received a text from: " + req.body.From);
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse(); // Initialize object - holds response that user receives later
  var addr = "";
  var status = "";
  var finalstring = req.body.Body;
  // obtain address and status of user
  addr = S(finalstring.toUpperCase()).between('ADDRESS: ', 'STATUS: ').humanize().s;
  status = S(finalstring.toUpperCase()).between('STATUS:').humanize().s;
  // Error checking on address and status.
    if (addr == "" || status == "") {
        twiml.message("That doesn't follow the format of:" +
            os.EOL + "ADDRESS:"+ os.EOL + "STATUS:" + os.EOL + "Please try again");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
    }
  // GoogleMaps URL to make request to to obtain latitude and longtitude coordinates
  var address = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addr.split(" ").join("+") + mapKey;
  // Vars that store latitude and longitude
  var lat = 0;
  var lng = 0;

  // Obtain latitude from Maps Reverse Geocoding API
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

        // Obtain longitude from Maps Reverse Geocoding API
        unirest.get(address, lng)
            .end(function (response, lng) {
              lng = response.body.results[0].geometry.location.lng;
              twiml.message("We received your request. You inputed your address as:" + os.EOL
                  + addr + os.EOL + "and your status as:" + os.EOL + status + os.EOL +". Your coordinates are: " + lat + ", " + lng + ". Your pin has been dropped on the global map!");
                status += " (This status was sent from the number: " + req.body.From + ")";
                
              // Create new person object to represent user
              var person = new Person({
                latitude: lat,
                longitude: lng,
                contentBody: status
              });

              //Save to mongo database
              person.save(function(err){
                if(err) throw err;
                console.log('User saved successfully!');
              });

              // Send end message back to user
              res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            });
      });
});

// Route for obtaining person marker data in database - query comes from map.js front-end
app.get('/data', function(req, res){
    // Obtains all documents in database
    Person.find({}, function(err, markers) {
        var markerMap = [];
        markers.forEach(function(marker) {
            markerMap.push(marker);
        });
        var dataJSON = JSON.stringify(markerMap);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(dataJSON);
    });
});

// Creates initial message to send to users - twilio queries app upon startup
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
