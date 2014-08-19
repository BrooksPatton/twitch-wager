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