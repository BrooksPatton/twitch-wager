// The view for the streamer
var StreamerConsoleView = Backbone.View.extend({
	// This view is for the streamer, and as such is a console of sorts instead of watching the stream. It is meant to be used on a phone or other mobile device as I'm assuming that the streamer is using their computer to stream the game and doesn't want another window to have to look at.
	className: 'col-xs-8',

	// The render method that will create the html element using the handlebars template
	render: function() {
		var template = Handlebars.compile($('#streamer-console-template').html());
		this.$el.html(template(this.model.toJSON()));
	},

	// jQuery style delegated click events that will fire methods on this object
	events: {
		'click #start-stream': 'registerStream',
		'click #start-round': 'startRound',
		'click #end-stream': 'endStream',
		'click #game-success': 'gameWon',
		'click #game-fail': 'gameLost'
	},

	// Method for the streamer to tell the server that they are streaming and want viewers to be able to vote
	registerStream: function() {
		// Telling the user model that a stream is being created
		this.model.createStream();
		// Re-render the view
		this.render();
		// Start rendering the wagers so that the streamer can see what viwers are betting
		this.renderWagers(this.model.get('stream'));
	},

	// The streamer is starting a betting round
	startRound: function() {
		this.model.startRound(this);
	},

	// The streamer is finished streaming
	endStream: function() {
		this.model.endStream(this);
	},

	// The streamer won the game this round!
	gameWon: function() {
		this.model.gameWon(this);
	},

	// The streamer lost the game this round
	gameLost: function() {
		this.model.gameLost(this);
	},

	// Show the wagers so that the streamer can see how many people are placing bets and what they are betting on
	renderWagers: function(stream) {
		// We need to create an instance of the backbone model
		var wagersView = new WagersView({ model: stream });
		// create the wagersview html element
		wagersView.render();
		// Inject the rendered html into the dom
		$('#wagers').html(wagersView.el);
	}
});