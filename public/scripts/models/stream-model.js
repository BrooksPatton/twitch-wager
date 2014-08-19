var Stream = Backbone.Model.extend({
	idAttribute: '_id',

	urlRoot: '/stream',

	betWin: function(user, view) {
		var wager = this.get('wagers');
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'success') {
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				wager[index].wager = 'success';
				wager[index].amount = 10;
			}
		}
		else {
			wager.unshift({
				user: user.get('name'),
				wager: 'success',
				amount: 10,
				userId: user.id
			});
		}
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	},

	betLose: function(user, view) {
		var wager = this.get('wagers');
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'fail') {
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				wager[index].wager = 'fail';
				wager[index].amount = 10;
			}
		}
		else {
			wager.unshift({
				user: user.get('name'),
				wager: 'fail',
				amount: 10,
				userId: user.id
			});
		}
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	}
});