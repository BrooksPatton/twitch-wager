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
		// Emptying out the wager div as we don't want it to be showing here
		$('#wager').html('');
		// Creating an instance of the Backbone selectStreamView view and passing in the streams collection as the model
		var selectStreamView = new SelectStreamView({
			collection: this.streams
		});
		// Create the html element for the index view
		selectStreamView.render();
		// Attaching the html to the dom
		$('#main').html(selectStreamView.el);
		// Starting the streams to update every once in a while with the server
		this.streams.start();
	},

	// Route handler for the streamer view
	streamer: function() {
		// Emptying out the wager div as we don't want anything in it right now
		$('#wager').html('');
		// Make sure that the streams collection is up to date
		this.streams.fetch();
		// Create an instance of the streamer view and pass in the user as the model
		var streamerConsoleView = new StreamerConsoleView({model: this.user});
		// Checking to see if the streamer is currently streaming on this site. Note that we are not checking if they are streaming on twitch. As far as I know that is not possible. Instead we are checking if the streamer has registered his stream as a game.
		var stream = this.streams.findWhere({username: this.user.get('name')});
		// If the streamer has a stream running now, then we are going to drop them right into the manage window.
		// Otherwise they will get the start stream button
		if(stream) {
			// The user has registered their stream as active and ready to play.
			this.user.set('streaming', true);
			// Save the stream in the user instance
			this.user.set('stream', stream);
			// Create the html for the streamer view
			streamerConsoleView.render();
			// Inject the view into the dom.
			$('#main').html(streamerConsoleView.el);
			// Render the wageers view using the stream as the model. The wagers view is instanced and rendered in the streamer view instance
			streamerConsoleView.renderWagers(stream);
		}
		else {
			// The user has no stream being played and therefore they won't show on the main page. Show the register button so the user can start their stream.
			this.user.set('streaming', false);
			// Creating the streamer view html
			streamerConsoleView.render();
			// Injecting the streamer view into the dom
			$('#main').html(streamerConsoleView.el);
		}
	},

	// The view stream route handler. This is the view where the viewer can watch the stream and bet on the outcome
	viewStream: function(streamer) {
		// Finding what stream we are watching
		var stream = this.streams.findWhere({username: streamer});
		// Creating the view stream view using the stream as a model
		var viewStreamView = new ViewStreamView({ model: stream });
		// Creating the wagers view instance using the stream as a model
		var wagersView = new WagersView({ model: stream });
		// Creating the wagers view html element
		wagersView.render();
		// Creating the view stream view html element
		viewStreamView.render();
		// Injecting the wagers and view stream html that was rendered previously into the dom
		$('#wagers').html(wagersView.el);
		$('#main').html(viewStreamView.el);
	}
}))();