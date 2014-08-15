// Setting up the router that will allow the user to use the back and forward button while using this single page app
var AppRouter = new (Backbone.Router.extend({
	// The list of routes that bockbone will serve. This is similar to app.js
	routes: {
		'twitch-wager': 'index'
	},

	// A method that we will call from main.js to start the router up
	start: function() {
		// Start Backbones router and use the new html5 push state to track the pages that we are at and have been to. This may not be compatible with all browsers
		Backbone.history.start({pushState: true});
	},

	// The initialize method is special, and will run as soon as the router starts
	initialize: function() {
		// Creating an instance of a user
		this.user = new User({ _id: userId });
		// Creating an instance of the fimView
		this.fimView = new FimView({ model: this.user });
		// Setting where the fimView will render its main element
		$('#user-fim-count').html(this.fimView.el);
		// Get the user from the server, which will start all of the views as they are looking at when the user is changed
		this.user.fetch();
	},

	// Route handler for the root directory of the single page app.
	index: function() {
		console.log('hello from the router');
	}
}))();