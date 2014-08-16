// The view for the streamer
var StreamerConsoleView = Backbone.View.extend({
	// This view is for the streamer, and as such is a console of sorts instead of watching the stream. It is meant to be used on a phone or other mobile device as I'm assuming that the streamer is using their computer to stream the game and doesn't want another window to have to look at.
	className: 'col-xs-8',
	render: function() {
		console.log(this.model);
		var template = Handlebars.compile($('#streamer-console-template').html());
		this.$el.html(template(this.model.toJSON()));
	},

	events: {
		'click #register-stream': 'registerStream',
		'click #start-betting': 'startBetting',
		'click #lock-betting': 'lockBetting',
		'click #end-stream': 'endStream'
	},

	registerStream: function() {
		this.model.createStream();
		this.render();
	},

	startBetting: function() {
		this.model.startBetting(this);
	},

	lockBetting: function() {
		this.model.lockBetting(this);
	},

	endStream: function() {
		this.model.endStream(this);
	}
});