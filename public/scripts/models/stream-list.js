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