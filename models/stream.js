// The model for the stream database objects. These will hold the information about the stream, who is viewing, what votes have been cast, and who is streaming
var restful = require('node-restful');
var mongoose = restful.mongoose;

var streamSchema = mongoose.Schema({
	username: String,
	wagers: Object,
	playing: {
		type: Boolean,
		default: false
	},
	betting: {
		type: Boolean,
		default: false
	},
	gameId: {
		type: Number,
		default: 0
	},
	gameStatus: String,
	previousResult: String
});

var Stream = restful.model('Stream', streamSchema);
Stream.methods(['get', 'put', 'post', 'delete']);

module.exports = Stream;