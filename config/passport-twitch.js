/**
 * NPM requires
 */
var passport = require('passport');
// We need the strategy defined by the passport-twitchtv module.
var TwitchtvStrategy = require('passport-twitchtv').Strategy;

/**
* Local requires
*/
// We need to require our keys so that we can authenticate with Twitch's OAUTH server
var twitchKeys = require('./twitch-keys');

// Passport serialization. Takes a user object and converts it into a small, unique string which is stored in the session
passport.serializeUser(function(user, done) {
	done(null, user);
});

// Passport deserialization. Essentially the inverse of above. This takes a user out of the session and converts it into an actual user object
passport.deserializeUser(function(id, done) {
	done(null, id);
});

// Define the Twitch.tv passport strategy. This will be used by passport whenever we reference it.
var twitchtvStrategy = new TwitchtvStrategy(
	{
		// Our clientID key from twitch.tv. Needs to be kept secret
		clientID: twitchKeys.clientId,
		// Our clientSecret key from twitch.tv. Needs to be kept double secret
		clientSecret: twitchKeys.clientSecret,
		// The route that twitch will call when the authentication is complete
		callbackURL: 'http://localhost:4088/auth/twitchtv/callback',
		// What rights we are requesting.
		// Available scopes
		/** user_read: Read access to non-public user information, such as email address.
		* user_blocks_edit: Ability to ignore or unignore on behalf of a user.
		* user_blocks_read: Read access to a user's list of ignored users.
		* user_follows_edit: Access to manage a user's followed channels.
		* channel_read: Read access to non-public channel information, including email address and stream key.
		* channel_editor: Write access to channel metadata (game, status, etc).
		* channel_commercial: Access to trigger commercials on channel.
		* channel_stream: Ability to reset a channel's stream key.
		 channel_subscriptions: Read access to all subscribers to your channel.
		* user_subscriptions: Read access to subscriptions of a user.
		* channel_check_subscription: Read access to check if a user is subscribed to your channel.
		* chat_login: Ability to log into chat and send messages.
		score: 'user_read'
		*/
	},
	// Callback function to be called whenever the passport module is called.
	function(accessToken, refreshToken, profile, done) {
		// Called whenever authentication succeeds
		process.nextTick(function() {
			return done(null, profile);
		});
	}
);

// Passport needs to know about the strategy that we just defined above.
passport.use(twitchtvStrategy);