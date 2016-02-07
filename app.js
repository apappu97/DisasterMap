// Necessary/not so necessary libs
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
var app = express();

// Twilio credentials
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
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Twilio makes a request here to have a message sent back to the user
app.post('/sms', function(req, res) {
    var addr = "";
    var status = "";
    // Get the json from the body
    var finalstring = req.body.Body;
    // String manipulation to get the Address and Status
    addr = (S(finalstring).between('ADDRESS:', 'STATUS: ').s).trim();
    // Formats the string for the url
    addr = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        address.split(" ").join("+") + "&key=AIzaSyChCIMnLJFcujELe5FdvrAKuYCMG9IJJDc";
    status = (S(finalstring).between('STATUS:').s).trim();
    var twilio = require('twilio');
    var twiml = new twilio.TwimlResponse();
    var lat;
    var lng;
    // Series of API calls to Google to get the geocode info
    unirest.get(addr, lat)
        .end(function(response, lat) {
            // traversing the json to get what we want
            lat = response.body.results[0].geometry.location.lat;
            unirest.get(address, lng)
                .end(function(response, lng) {
                    lng = response.body.results[0].geometry.location.lng;
                    twiml.message("We received your request. You sent your address as:" + os.EOL + addr + os.EOL + "and your status as:" + os.EOL + status + ". Your lng is: " + lng + " and your lat is: " + lat);
                    res.writeHead(200, {
                        'Content-Type': 'text/xml'
                    });
                    // Sent that baby off!
                    res.end(twiml.toString());
                });
        });
});

// Initializes a text to the phone number
app.listen(8080, function() {
    twilio.messages.create({
        body: "This is a message from your local nonprofit. Please send us your address and needs in the following format." + os.EOL +
        "ADDRESS:" + os.EOL + "STATUS:",
        to: "+12102683553",
        from: "+12622717436"
    }, function(err, message) {
        process.stdout.write(message.sid);
    });
});
module.exports = app;