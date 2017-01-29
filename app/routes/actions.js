var exec = require('child_process').exec;
var action = require('../operations/actions').exec;

module.exports = {

	start: function (req, res, next) {
		action.start(req.body.script, function (params) {
			
		});
	}
};