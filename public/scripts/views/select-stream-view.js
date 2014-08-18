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