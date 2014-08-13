/**
 * NPM requires
 */
var express = require('express');
var bodyParser = require('body-parser');

/**
 * Local file requires
 */
var indexController = require('./controllers/index.js');

/**
 * Configure the express server
 */
// Create the express instance in the variable app
var app = express();
// We are using jade to compile our view templates into html
app.set('view engine', 'jade');
// Telling express where our jade templates live
app.set('views', __dirname + '/views');
// Everything in the public folder should be made public and accessable to the browser without a specific request
app.use(express.static(__dirname + '/public'));
// Body parser puts get and post requests into req.query and rec.body
app.use(bodyParser.urlencoded({extended: false}));

/**
 * Route handlers
 */
 // When the browser navigates to /
app.get('/', indexController.index);

/**
 * Start the server
 */
var server = app.listen(4088, function() {
	console.log('Express server listening on localhost:' + server.address().port);
});