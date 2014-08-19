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
// Backbone model for the stream
var Stream = Backbone.Model.extend({
	// We are using a mongo database and therefore need to set the idAttribute property to _id as backbone normally wants to use id.
	idAttribute: '_id',

	// Telling the model where the api route is for the data. All CRUD requests will go through this route
	urlRoot: '/stream',

	// The user clicked on the success button, indicating that the viewer beleives the the streamer will be successful
	betWin: function(user, view) {
		// getting the list of wagers that all viewers have made
		var wager = this.get('wagers');
		// Getting the current viewers but, if they have one
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			// If they have a bet, then we are going to change the bet inline so that we don't get mutliple lines for the same user in the wagers view
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'success') {
				// If the viever had already bet on success, then just add to their bet
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				// Otherwise we are going to change their bet to success and reset down to 10
				wager[index].wager = 'success';
				wager[index].amount = 10;
			}
		}
		else {
			// The viewer has yet to make a bet, so add them to the top of the list.
			wager.unshift({
				user: user.get('name'),
				wager: 'success',
				amount: 10,
				userId: user.id
			});
		}
		// Save the wagers list back to the server
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	},

	// Same thing as above, but this time we are wagering on the player failing
	betLose: function(user, view) {
		var wager = this.get('wagers');
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'fail') {
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				wager[index].wager = 'fail';
				wager[index].amount = 10;
			}
		}
		else {
			wager.unshift({
				user: user.get('name'),
				wager: 'fail',
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
// Streams Backbone collection that will hold all of the streams
var Streams = Backbone.Collection.extend({
	model: Stream,
	url: '/stream',
	// When the start method is called, begin updating the collection constantly
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
		// Storing the this value away so that we can access it inside of a callback function
		var self = this;
		// Every once in a while update the model, when it is successfuly updated then render it again.
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
// Backbone constructor for the Main page where the viewer will select the stream that they want to view. Takes a collection as its data model
var SelectStreamView = Backbone.View.extend({
	// The viewer is using a desktop as the video is in adobe flash format...until twitch updates at least
	className: 'container',

	// The initialize method runs as soon as the instance is created
	initialize: function() {
		// Whenever the collection has something added to it, re-render the page
		this.collection.on('add', this.render, this);
		// Whenever something is removed from the collection, re-render the page
		this.collection.on('remove', this.render, this);
		// Preparing the handlebars template
		this.template = Handlebars.compile($('#select-stream-template').html());
	},

	// The events method is like a jQuery event delegation.
	events: {
		// Whenever the user clicks on one of the streams listed on the page, run the selected Stream method
		'click .stream': 'selectedStream'
	},

	// renders the html into the el property
	// Once the el property has been embedded into the dom calling this method is enough to update the dom
	render: function() {
		// Using the handlebars template to create the html element and store it in el
		this.$el.html(this.template({streams: this.collection.toJSON()}));
		// Returning the el property so that calling the render method can be chained
		return this.el;
	},

	// Tell the router to navigate to the view stream route and pass in which streamer we are going to watch.
	selectedStream: function(e) {
		AppRouter.navigate('view-stream/' + $(e.currentTarget).data('name'), {
				trigger: true
		});
	}
});
// Backbone view object for viewing the stream itself. This will take a stream object
var ViewStreamView = Backbone.View.extend({
	// We want the view to take up the entire screen so we are using a container-fluid bootstrap class.
	className: 'container-fluid',

	// The initialize method runs as soon as the view instance is created
	initialize: function() {
		// Preparing the template here so the render method doesn't have to do it each time
		this.template = Handlebars.compile($('#view-stream-template').html());
		// We also need access to the user model so we are pulling it in here.
		this.user = new User({ _id: userId });
		// Get the user details from the server
		this.user.fetch();
		// Saving the this variable so that we can access it later
		var self = this;
		// Having the view update regularly so that we can determine if the user is allowed to place bets.
		setInterval(function() {
			self.model.fetch();
		}, 2000);
		// When the model changes, then run the setBets method. We are also going to pass the this variable so we have access to it.
		this.model.on('change', this.setBets, this);
	},

	// Registering click events in backbone instead of jQuery.
	events: {
		'click #bet-win': 'betWin',
		'click #bet-lose': 'betLose'
	},

	// Render method that will update the dom
	render: function() {
		// Passing the model in json format to the handlebars template. The resulting html is placed in the views el variable
		this.$el.html(this.template(this.model.toJSON()));
		// Returning the el variable so that it can be accessed through chaining
		return this.el;
	},

	// The method for if the viewer clicks the win button
	betWin: function() {
		this.model.betWin(this.user, this);
	},

	// The method for if the viewer clicks the lose button
	betLose: function() {
		this.model.betLose(this.user, this);
	},

	// The method for updating the fim view
	updateFimView: function() {
		// Here we are fetching the latest data from the server, and passing a object with the success method.
		// The success method gets called as soon as the fetch is successfully completed.
		this.user.fetch({
			success: function(user) {
				// Creating an instance of the fimView
				var fimView = new FimView({ model: user });
				// Rendering the fim view which creates the fimView.el property
				fimView.render();
				// Injecting the fimView html into the dom
				$('#user-fim-count').html(fimView.el);
			}
		});
		
	},

	// The method for showing or hiding the bet buttons from view
	setBets: function() {
		if(this.model.get('betting')) {
			$('#betting-on').removeClass('hidden');
		}
		else {
			$('#betting-on').addClass('hidden');	
		}
	}
});
// Backbone view for the wagers. It will take a stream instance as its model
var WagersView = Backbone.View.extend({
	// Setting the bootstrap grid object as the default classname for the div. This is where we can change how wide the wagers view is.
	className: 'col-xs-4',

	// Initialize runs as soon as the view is created in an instance
	initialize: function() {
		// Prepare the handlebars template for later use. Putting it here means less work for the render function
		this.template = Handlebars.compile($('#wagers-template').html());
		// Whenever the model is...well anything happens to it, then re-render the wagers view
		this.model.on('all', this.render, this);
		// Saving the this value so that we can access it in a callback function
		var self = this;
		// Have the model update itself from the server regularly.
		setInterval(function() {
			self.model.fetch();
		}, 1000);
	},

	// Render method that will update the dom
	render: function() {
		// Create the html using the handlebars template. We are passing the model that has been turned into a json object so that handlebars can access the data without any changes
		this.$el.html(this.template(this.model.toJSON()));
		// If we return the rendered element, then when render is called it can be chained
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
// This is the shorthand version of the standard jquery on.ready function
$(function() {
	// Start the single page app
	AppRouter.start();
});