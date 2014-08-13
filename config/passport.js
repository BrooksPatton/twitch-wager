// Exporting middleware so that we can block access to routes if the user isn't authenticated. Users not allowed will be redirected back to the root page
module.exports = {
	ensureAuthenticated: function(req, res, next) {
		// If the current user is logged in move along, nothing to see here.
		if(req.isAuthenticated()) return next();
		// If we get here, then the user is not logged in. Sending them back to the root page
		res.redirect('/');
	}
};