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