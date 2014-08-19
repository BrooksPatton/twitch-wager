// Backbone model for the stream
var Stream = Backbone.Model.extend({
	// We are using a mongo database and therefore need to set the idAttribute property to _id as backbone normally wants to use id.
	idAttribute: '_id',

	// Telling the model where the api route is for the data. All CRUD requests will go through this route
	urlRoot: '/stream',

	// The user clicked on the success button, indicating that the viewer beleives the the streamer will be successful
	betWin: function(user, view) {
		// getting the list of wagers that all viewers have made
		var wager = this.get('wagers');
		// Getting the current viewers but, if they have one
		var currentBet = _.findWhere(wager, {userId: user.id});
		if(currentBet) {
			// If they have a bet, then we are going to change the bet inline so that we don't get mutliple lines for the same user in the wagers view
			var index = _.indexOf(wager, currentBet);
			if(currentBet.wager === 'success') {
				// If the viever had already bet on success, then just add to their bet
				wager[index].amount = currentBet.amount + 10;
			}
			else {
				// Otherwise we are going to change their bet to success and reset down to 10
				wager[index].wager = 'success';
				wager[index].amount = 10;
			}
		}
		else {
			// The viewer has yet to make a bet, so add them to the top of the list.
			wager.unshift({
				user: user.get('name'),
				wager: 'success',
				amount: 10,
				userId: user.id
			});
		}
		// Save the wagers list back to the server
		this.set('wagers', wager);
		this.save();
		user.removeFim(10);
		view.updateFimView();
	},

	// Same thing as above, but this time we are wagering on the player failing
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