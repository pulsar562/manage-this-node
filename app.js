var express      = require('express');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var _            = require('lodash');

var config = require(__dirname + '/lib/config');

var app = express();
app.set('config', config);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// set local variables
app.locals.title    = config.app.title;
app.locals.port     = config.app.port;
app.locals.services = config.services;

/*
 * GET index
 */
app.get('/', function(req, res, next) {

  var enabledServices = _.filter(res.app.locals.services, function(item) {
    return (item.url !== undefined && item.url !== '');
  });

  res.render('index', {
    title: res.app.locals.title,
    enabledServices: _.sortBy(enabledServices, 'sort'),
    allServices: _.sortBy(res.app.locals.services, 'sort')
  });
});

/*
 * POST settings
 */
app.post('/', function(req, res) {

  var services = [];
  _.forEach(req.body.services, function(n, key) {
    var _id  = n._id;
    var name = n.name;
    var url  = n.url;
    var icon = n.icon;
    var sort = n.sort || null;

    var defaultPage = false;
    if (_id == req.body.default) {
      defaultPage = true;
    }

    services.push({
      '_id'    : _id,
      'name'   : name,
      'url'    : url,
      'icon'   : icon,
      'sort'   : parseInt(sort, 10),
      'default': defaultPage
    });
  });

  // update for session
  res.app.locals.title    = req.body.title;
  res.app.locals.services = services;

  // write file with the follow  contents
  config.save(req.body.title, req.body.port, req.body.version, services);  

  // redirect to home
  res.redirect('/');

});

module.exports = app;
