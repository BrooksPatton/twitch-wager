// The controller for authenticating users through passport
var authenticationController = {
	// Route handler for /auth/logout.
	logout: function(req, res) {
		// Passport injects the logout method for us to call
		req.logout();
		// Now that the user is logged out we need to send them someplace safe. I'm sending them to the /
		res.redirect('/');
	}
};

// Make the authenticationController available to all node files
module.exports = authenticationController;