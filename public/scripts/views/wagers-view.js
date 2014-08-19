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