// Create the Backbone model for the User
var User = Backbone.Model.extend({
	// We need to set the idAttribute since we are connecting to a mongo database. Mongo uses _id instead of backbones default id.
	idAttribute: '_id',
	// The root url for the user api is /user
	urlRoot: '/user',

	createStream: function() {
		this.set('stream', new Stream({
			username: this.get('name')
		}));
		this.get('stream').save();
		this.set('streaming', true);
	},

	startRound: function(view) {
		this.get('stream')
			.set('playing', true)
			.set('betting', true)
			.set('gameId', this.get('stream').get('gameId') + 1)
			.save();
		this.startBetTimer();
		view.render();
	},

	lockBetting: function() {
		this.get('stream').fetch({
			success: function(stream) {
				stream.set('betting', false).save();
			}
		});
	},

	endStream: function(view) {
		this.get('stream').destroy();
		this.unset('stream');
		this.set('streaming', false);
		view.render();
	},

	startBetTimer: function() {
		var self = this;
		setTimeout(function() {
			self.lockBetting();
		}, 10000);
	},

	gameWon: function(view) {
		this.get('stream')
			.set('previousResult', 'won')
			.set('playing', false)
			.save();
		view.render();
		$.post('/game-won', {gameId: this.get('stream').id});
	},

	gameLost: function(view) {
		this.get('stream')
			.set('previousResult', 'lost')
			.set('playing', false)
			.save();
		view.render();
		$.post('/game-lost', {gameId: this.get('stream').id});
	},

	removeFim: function(amount) {
		this.set('fim', this.get('fim') - amount).save();
	}
});