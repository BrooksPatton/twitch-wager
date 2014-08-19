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
var Stream = Backbone.Model.extend({
	idAttribute: '_id',

	urlRoot: '/stream',

	betWin: function(user, view) {
		var wager = this.get('wagers');
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'win') {
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				wager[index].wager = 'win';
				wager[index].amount = 10;
			}
		}
		else {
			wager.unshift({
				user: user.get('name'),
				wager: 'win',
				amount: 10,
				userId: user.id
			});
		}
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	},

	betLose: function(user, view) {
		var wager = this.get('wagers');
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'lose') {
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				wager[index].wager = 'lose';
				wager[index].amount = 10;
			}
		}
		else {
			wager.unshift({
				user: user.get('name'),
				wager: 'lose',
				amount: 10,
				userId: user.id
			});
		}
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	}
});
var Streams = Backbone.Collection.extend({
	model: Stream,
	url: '/stream',
	start: function() {
		var self = this;
		setInterval(function() {
			self.fetch();
		}, 1000);
	}
});
// Creating the backbone view for the user
var FimView = Backbone.View.extend({
	// By default the tag that is created is a <div>. I already have a div in the html, so we are going to put a p tag in instead
	tagName: 'p',
	// Add the following classes to the top level tag that is created
	className: 'navbar-text',
	// Initialize is a special method that runs as soon as the view is created.
	initialize: function() {
		var self = this;
		setInterval(function() {
			self.model.fetch({
				success: function(user) {
					self.render();
				}
			});
		}, 1000);
	},
	// The render function that will create the html that will be inserted into the dom
	render: function() {
		this.$el.html('FIM: ' + this.model.get('fim'));
	}
});
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
var SelectStreamView = Backbone.View.extend({
	className: 'container',

	initialize: function() {
		this.collection.on('add', this.render, this);
		this.collection.on('remove', this.render, this);
		this.template = Handlebars.compile($('#select-stream-template').html());
	},

	events: {
		'click .stream': 'selectedStream'
	},

	render: function() {
		this.$el.html(this.template({streams: this.collection.toJSON()}));
		return this.el;
	},

	selectedStream: function(e) {
		AppRouter.navigate('view-stream/' + $(e.currentTarget).data('name'), {
				trigger: true
		});
	}
});
var ViewStreamView = Backbone.View.extend({
	className: 'container-fluid',

	initialize: function() {
		this.template = Handlebars.compile($('#view-stream-template').html());
		this.user = new User({ _id: userId });
		this.user.fetch();
		var self = this;
		setInterval(function() {
			self.model.fetch();
		}, 2000);
		this.model.on('change', this.setBets, this);
	},

	events: {
		'click #bet-win': 'betWin',
		'click #bet-lose': 'betLose'
	},

	render: function() {
		console.log(this.model.toJSON());
		this.$el.html(this.template(this.model.toJSON()));
		return this.el;
	},

	betWin: function() {
		this.model.betWin(this.user, this);
	},

	betLose: function() {
		this.model.betLose(this.user, this);
	},

	updateFimView: function() {
		this.user.fetch({
			success: function(user) {
				var fimView = new FimView({ model: user });
				fimView.render();
				$('#user-fim-count').html(fimView.el);
			}
		});
		
	},

	setBets: function() {
		if(this.model.get('betting')) {
			$('#betting-on').removeClass('hidden');
		}
		else {
			$('#betting-on').addClass('hidden');	
		}
	}
});
var WagersView = Backbone.View.extend({
	className: 'col-xs-4',

	initialize: function() {
		this.template = Handlebars.compile($('#wagers-template').html());
		this.model.on('all', this.render, this);
		var self = this;
		setInterval(function() {
			self.model.fetch();
		}, 1000);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this.el;
	}
});
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
		$('#wager').html('');
		var selectStreamView = new SelectStreamView({
			collection: this.streams
		});
		selectStreamView.render();
		$('#main').html(selectStreamView.el);
		this.streams.start();
	},

	streamer: function() {
		$('#wager').html('');
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
			streamerConsoleView.renderWagers(stream);
		}
		else {
			// The user has no stream being played and therefore they won't show on the main page. Show the register button so the user can start their stream.
			this.user.set('streaming', false);
			streamerConsoleView.render();
			$('#main').html(streamerConsoleView.el);
		}
	},

	viewStream: function(streamer) {
		var stream = this.streams.findWhere({username: streamer});
		var viewStreamView = new ViewStreamView({ model: stream });
		var wagersView = new WagersView({ model: stream });
		wagersView.render();
		viewStreamView.render();
		$('#wagers').html(wagersView.el);
		$('#main').html(viewStreamView.el);
	}
}))();
$(function() {
	// Start the single page app
	AppRouter.start();
});