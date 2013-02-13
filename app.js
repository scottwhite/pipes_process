
/**
 * Module dependencies.
 */

var express = require('express'),
  creds = require('./config').Creds,
  routes = require('./routes'),
  incoming = require('./routes/incoming'),
  status = require('./routes/status'),
  phones = require('./routes/phones'),

  http = require('http'),
  path = require('path'),
  twilio = require('twilio');

var app = express();
var _t = new twilio.RestClient(creds.sid, creds.auth_token);


app.configure(function(){
  app.set('provider',_t);
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/incoming',incoming.answer);
app.post('/status',status.index);
app.get('/phones/:number', phones.available);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
