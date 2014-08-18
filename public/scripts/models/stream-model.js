var Stream = Backbone.Model.extend({
	idAttribute: '_id',

	urlRoot: '/stream',

	betWin: function(user, view) {
		var wager = this.get('wagers');
		wager.unshift({
			user: user.get('name'),
			wager: 'win',
			amount: 10
		});
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	},

	betLose: function(user, view) {
		var wager = this.get('wagers');
		wager.unshift({
			user: user.get('name'),
			wager: 'lose',
			amount: 10
		});
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	}
});