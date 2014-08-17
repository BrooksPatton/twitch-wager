// Setting up the router that will allow the user to use the back and forward button while using this single page app
var AppRouter = new (Backbone.Router.extend({
	// The list of routes that bockbone will serve. This is similar to app.js
	routes: {
		'twitch-wager': 'index',
		'streamer': 'streamer',
		'view-stream/:streamer': 'viewStream'
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
		// Creating an instance of the streams collection which will hold all of the current streams
		this.streams = new Streams();
		// Get the current user from the server using the id that was embedded into the html as a basis.
		this.user.fetch();
		// Setting a click handler on the register new stream button to take the viewer to the register stream page
		$('#register-stream').on('click', function() {
			AppRouter.navigate('streamer', {
				trigger: true
			});
		});
	},

	// Route handler for the root directory of the single page app.
	index: function() {
		var selectStreamView = new SelectStreamView({
			collection: this.streams
		});
		selectStreamView.render();
		$('#main').html(selectStreamView.el);
		this.streams.start()
	},

	streamer: function() {
		this.streams.fetch();
		var streamerConsoleView = new StreamerConsoleView({model: this.user});
		// Checking to see if the streamer is currently streaming on this site. Note that we are not checking if they are streaming on twitch. As far as I know that is not possible. Instead we are checking if the streamer has registered his stream as a game.
		var stream = this.streams.findWhere({username: this.user.get('name')});
		if(stream) {
			// The user has registered their stream as active and ready to play.
			this.user.set('streaming', true);
			this.user.set('stream', stream);
			streamerConsoleView.render();
			$('#main').html(streamerConsoleView.el);
		}
		else {
			// The user has no stream being played and therefore they won't show on the main page. Show the register button so the user can start their stream.
			this.user.set('streaming', false);
			streamerConsoleView.render();
			$('#main').html(streamerConsoleView.el);
		}
	},

	viewStream: function(streamer) {
		console.log('hi from viewStream, ' + streamer);
	}
}))();