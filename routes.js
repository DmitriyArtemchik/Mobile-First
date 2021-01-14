// const main = require('./handlers/main.js');

module.exports = function(app) {

	// miscellaneous routes
	app.get('/', main.home);
};
