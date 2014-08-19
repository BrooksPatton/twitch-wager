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