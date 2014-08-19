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