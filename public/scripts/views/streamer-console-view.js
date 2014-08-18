// The view for the streamer
var StreamerConsoleView = Backbone.View.extend({
	// This view is for the streamer, and as such is a console of sorts instead of watching the stream. It is meant to be used on a phone or other mobile device as I'm assuming that the streamer is using their computer to stream the game and doesn't want another window to have to look at.
	className: 'col-xs-8',
	render: function() {
		var template = Handlebars.compile($('#streamer-console-template').html());
		this.$el.html(template(this.model.toJSON()));
	},

	events: {
		'click #start-stream': 'registerStream',
		'click #start-round': 'startRound',
		'click #end-stream': 'endStream',
		'click #game-won': 'gameWon',
		'click #game-lost': 'gameLost'
	},

	registerStream: function() {
		this.model.createStream();
		this.render();
		this.renderWagers(this.model.get('stream'));
	},

	startRound: function() {
		this.model.startRound(this);
	},

	endStream: function() {
		this.model.endStream(this);
	},

	gameWon: function() {
		this.model.gameWon(this);
	},

	gameLost: function() {
		this.model.gameLost(this);
	},

	renderWagers: function(stream) {
		var wagersView = new WagersView({ model: stream });
		wagersView.render();
		$('#wagers').html(wagersView.el);
	}
});