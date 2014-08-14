// The user model
// We are requiring mongoose through the node-restful module as the restful magic mostly happens here
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Creating the model schema that tells mongoose what the database  looks like
var userSchema = mongoose.Schema({
	id: Number, // The users Twitch.tv id number. This should always be a number
	FIM: {
		type: Number, // The Fake Internet Money that the User has.
		default: 500 // The user start their account with this many FIMs
	}
});

// Creating the User object that node-restful will use to set up the routes
var User = restful.model('User', userSchema);
// This will set up get, put, post, and delete routes when User is called in app.js
User.methods(['get', 'put', 'post', 'delete']);

// Make the User model available to all node files
module.exports = User;