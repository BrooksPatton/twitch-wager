// The model for the stream database objects. These will hold the information about the stream, who is viewing, what votes have been cast, and who is streaming
var restful = require('node-restful');
// Creating a restful server using node-restful module. This requires us to pull in mongoose through restful
var mongoose = restful.mongoose;

// We can still create the schema like normal though
var streamSchema = mongoose.Schema({
	username: String,
	wagers: {
		type: Array,
		default: []
	},
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
// This allows us to set up crud on the server
Stream.methods(['get', 'put', 'post', 'delete']);

module.exports = Stream;