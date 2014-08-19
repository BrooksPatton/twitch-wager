// Create the Backbone model for the User
var User = Backbone.Model.extend({
	// We need to set the idAttribute since we are connecting to a mongo database. Mongo uses _id instead of backbones default id.
	idAttribute: '_id',
	// The root url for the user api is /user
	urlRoot: '/user',

	// Method to create a stream, saving that stream in the model, and setting the streams streaming status.
	createStream: function() {
		// Storing the stream into the model
		this.set('stream', new Stream({
			username: this.get('name')
		}));
		// Saving the embedded stream to the server.
		this.get('stream').save();
		// Setting the streaming status of the streamer to true.
		this.set('streaming', true);
	},

	// Start the round of betting.
	startRound: function(view) {
		// Getting the stream object embedded into the model, setting the playing and betting status to true, setting the gameId so that we can track how many games have been played this session. Anf finally saving the stream to the server.
		this.get('stream')
			.set('playing', true)
			.set('betting', true)
			.set('gameId', this.get('stream').get('gameId') + 1)
			.save();
		// Have the stream change the betting status to false after a short period of time
		this.startBetTimer();
		// Render the view that was passed in which will update the dom
		view.render();
	},

	// Lock the betting so that nobody else can bet
	lockBetting: function() {
		this.get('stream').fetch({
			success: function(stream) {
				stream.set('betting', false).save();
			}
		});
	},

	// The streamer is finished. Delete the embedded stream which will remove the streamer from the front page
	endStream: function(view) {
		this.get('stream').destroy();
		this.unset('stream');
		this.set('streaming', false);
		view.render();
	},

	// Start the bet timer, at the end (in miliseconds) turn the ability to bet off
	startBetTimer: function() {
		var self = this;
		setTimeout(function() {
			self.lockBetting();
		}, 60000);
	},

	// The streamer clicked the success button. Set the result in the stream, and send a post request to the server to have it resolve the bet
	gameWon: function(view) {
		this.get('stream')
			.set('previousResult', 'success')
			.set('playing', false)
			.save();
		view.render();
		$.post('/game-won', {gameId: this.get('stream').id});
	},

	// The streamer clicked the failure button. Set the result in the stream, and send a post request to the server to have it resolve the bet
	gameLost: function(view) {
		this.get('stream')
			.set('previousResult', 'fail')
			.set('playing', false)
			.save();
		view.render();
		$.post('/game-lost', {gameId: this.get('stream').id});
	},

	// Every time the viewer clicks on a bet they should lose some fake internet money
	removeFim: function(amount) {
		this.set('fim', this.get('fim') - amount).save();
	}
});