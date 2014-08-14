/**
 * NPM requires
 */
 // We are creating our server with express
var express = require('express');
// body parser allows us to grab post and get requests easily from rec.query and rec.body
var bodyParser = require('body-parser');
// Allows us to have access to cookies.
var cookieParser = require('cookie-parser');
// Allows us to use verbs like put and delete for a restful server
var methodOverride = require('method-override');
// Allows us to use cookies to keep track of a user accross multiple pages
var session = require('express-session');
// We are using passport to authenticate users
var passport = require('passport');

/**
 * Local file requires
 */
var indexController = require('./controllers/index.js');
var passportConfig = require('./config/passport.js');
var authenticationController = require('./controllers/authentication');
var passportTwitch = require('./config/passport-twitch.js');
var twitchWagerController = require('./controllers/twitch-wager.js');

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
// Body parser parses through json data
app.use(bodyParser.json());
// Load the cookie parser so it can be used later
app.use(cookieParser());
// Load in the method override module so that we can have a restful server
app.use(methodOverride('X-HTTP-Method-Override'));
// Initialize the express session. Needs to be give a secret property which will encrypt the cookies. This should be something not easily guessable!!!
app.use(session({secret: 'alsdhfksjh'}));
// Initializing passport
app.use(passport.initialize());
// Allow passport to support persistence login sessions
app.use(passport.session());

/**
 * Route handlers
 */
 // When the browser navigates to /
app.get('/', indexController.index);
// Route handler for authenticating with Twitch.tv. Using passport.authenticate() as a route middleware to authenticate the request. As this redirects the user to Twitch.tvs servers the callback function is not called
app.get('/auth/twitchtv', passport.authenticate('twitchtv', { scope: [ 'user_read' ] }),
	function(req, res) {
		// This function will not be called as the user will be redirected to twitch.tv for authentication
	});
// Route handler for the response that twitch.tv is sending us after we sent them our viewer for authentication. Using passport.authenticate() as middleware to authenticate the request. If the authentication failed, then the User will be redirected back to the front page so they can try again. If the authentication is successful, then send the user to the index of the main app
app.get('/auth/twitchtv/callback', passport.authenticate('twitchtv', {
	failureRedirect: '/',
	successRedirect: '/twitch-wager'
}),
function(req, res) {
	// Nothing should happen here because our redirects should happen first
});
// Route handler to logout the user
app.get('/auth/logout', authenticationController.logout);

// ***** IMPORTANT ***** //
// By including this middleware (defined in our config/passport.js module.exports),
// We can prevent unauthorized access to any route handler defined after this call
// to .use()
app.use(passportConfig.ensureAuthenticated);

// The root of the twitch wager app
app.get('/twitch-wager', twitchWagerController.index);

/**
 * Start the server
 */
var server = app.listen(4088, function() {
	console.log('Express server listening on localhost:' + server.address().port);
});