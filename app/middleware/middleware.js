var fs = require('fs');
var Nodo = require('../operations/nodos');
module.exports = {

	isAuthorized: function (req, res, next) {
		return next();
		res.redirect('/login');
	}
};