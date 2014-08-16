// Create the Backbone model for the User
var User = Backbone.Model.extend({
	// We need to set the idAttribute since we are connecting to a mongo database. Mongo uses _id instead of backbones default id.
	idAttribute: '_id',
	// The root url for the user api is /user
	urlRoot: '/user',

	createStream: function() {
		this.set('stream', new Stream({
			username: this.get('name')
		}));
		this.get('stream').save();
		this.set('streaming', true);
	},

	startBetting: function(view) {
		this.get('stream').set('betting', true).save();
		view.render();
	},

	lockBetting: function(view) {
		this.get('stream').set('betting', false).save();
		view.render();
	}
});