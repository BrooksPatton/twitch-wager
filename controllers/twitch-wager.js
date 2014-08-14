// The controller for the single page app Twitch Wagers
var twitchWagerController = {
	// route controller for the root of the main app. This mainly gets called when the user authenticates from the landing page
	index: function(req, res) {
		// Render the single page app twitch wager and send it the user object
		res.render('twitch-wager', { user: req.user });
	}
};

// Make the controller available to other node files
module.exports = twitchWagerController;