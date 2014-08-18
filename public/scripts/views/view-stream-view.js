var ViewStreamView = Backbone.View.extend({
	className: 'container-fluid',

	initialize: function() {
		this.template = Handlebars.compile($('#view-stream-template').html());
		this.user = new User({ _id: userId });
		this.user.fetch();
		var self = this;
		setInterval(function() {
			self.model.fetch();
		}, 2000);
		this.model.on('change', this.setBets, this);
	},

	events: {
		'click #bet-win': 'betWin',
		'click #bet-lose': 'betLose'
	},

	render: function() {
		console.log(this.model.toJSON());
		this.$el.html(this.template(this.model.toJSON()));
		return this.el;
	},

	betWin: function() {
		this.model.betWin(this.user, this);
	},

	betLose: function() {
		this.model.betLose(this.user, this);
	},

	updateFimView: function() {
		this.user.fetch({
			success: function(user) {
				var fimView = new FimView({ model: user });
				fimView.render();
				$('#user-fim-count').html(fimView.el);
			}
		});
		
	},

	setBets: function() {
		if(this.model.get('betting')) {
			$('#betting-on').removeClass('hidden');
		}
		else {
			$('#betting-on').addClass('hidden');	
		}
	}
});