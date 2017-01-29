var exec = require('child_process').exec;
var action = require('../operations/action');

module.exports = {

	start: function (req, res, next) {
		action.start(req.body.script, function (err, pid) {
			if (err) {
				return res.send({
					ok: 'false',
					error: err
				});
			}

			return res.send({
				ok: 'true',
				pid: parseInt(pid)
			});
		});
	},

	file: function (req, res, next) {
		return res.send({
			ok: 'true'
		});
	},

	status: function (req, res, next) {
		return res.send();
	},

	scriptStatus: function (req, res, next) {
		action.scriptStatus(req.params.pid, function (err, status) {
			return res.send({status: status});
		});
	},

	stopScript: function (req, res, next) {
		action.stopScript(req.params.pid, function (err, pid) {
			if (err) {
				return res.send({
					ok: 'false',
					error: err
				});
			}

			return res.send({
				ok: 'true',
				pid: parseInt(pid)
			});
		});
	},

	restartNode: function (req, res, next) {
		return res.send({
			ok: 'true'
		});
		action.restartNode();
	}
};