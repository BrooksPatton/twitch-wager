// Creating the backbone view for the user
var FimView = Backbone.View.extend({
	// By default the tag that is created is a <div>. I already have a div in the html, so we are going to put a p tag in instead
	tagName: 'p',
	// Add the following classes to the top level tag that is created
	className: 'navbar-text',
	// Initialize is a special method that runs as soon as the view is created.
	initialize: function() {
		// Whenever the view changes we want to rerender it. This will prevent us from having to place code to rerender the view every time we update the model.
		this.model.on('change', this.render, this);
	},
	// The render function that will create the html that will be inserted into the dom
	render: function() {
		this.$el.html('FIM: ' + this.model.get('fim'));
	}
});