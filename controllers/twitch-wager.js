// We need mongoose as we will be searching through the database and possible creating users
var mongoose = require('mongoose');

// We need the User object to do the searching
var User = require('../models/user');

// The controller for the single page app Twitch Wagers
var twitchWagerController = {
	// route controller for the root of the main app. This mainly gets called when the user authenticates from the landing page
	index: function(req, res) {
		console.log(req.user);
		// First things first, we need to check to see if the user exists in the database, if they do, then get the user information so we can send it to the jade template.
		// If the user doesn't exist, then we will create them and send them to the jade template
		User.findOne({id: req.user.id}).exec(function(err, user) {
			// If there was a problem getting the data from the database then lets log it
			if(err) {
				console.log('There was an error getting the user data, ', err);
				return res.redirect('/auth/logout'); // Sending the user back home so they can try again
			}

			// If the user exists then we are going to send the data to the jade template
			if(user) {
				res.render('twitch-wager', {
					userId: user._id
				});
			}
			// The user doesn't exist, we will have to create one
			else {
				var newUser = new User({
					id: req.user.id,
					name: req.user.username,
					displayName: req.user.displayName
				});
				newUser.save(function(err, user) {
					if(err) {
						console.log('There was an error saving a new user, ', err);
						return res.redirect('/auth/logout'); // Sending the user back home
					}
					// The new user has been created, time to render the jade template with the new user
					res.render('twitch-wager', {
						userId: user._id
					});
				});
			}
		});
	}
};

// Make the controller available to other node files
module.exports = twitchWagerController;