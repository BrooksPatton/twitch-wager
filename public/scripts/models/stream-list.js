var Streams = Backbone.Collection.extend({
	model: Stream,
	url: '/stream',
	initialize: function() {
		var self = this;
		setInterval(function() {
			self.fetch();
		}, 1000);
	}
});