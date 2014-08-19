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