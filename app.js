var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');

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
  twiml.message(req.body);
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(8080, function() {
  twilio.messages.create({
    body: "Jenny please?! I love you <3",
    to: "+12102683553",
    from: "+12108800132"
  }, function(err, message) {
    process.stdout.write(message.sid);
  });
});
module.exports = app;
