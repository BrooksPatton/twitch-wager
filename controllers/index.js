/**
 * The index controller for everything on the 'index' (/) page
 * @type {Object}
 */
var indexController = {
	// Route handler for /
	index: function(req, res) {
		// Compile the index jade template and send back to the browser
		res.render('index');
	}
};

/**
 * Make the indexController available to all other node files
 * @type {[type]}
 */
module.exports = indexController;