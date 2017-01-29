var exec = require('child_process').exec;

module.exports = {

	start: function (script, callback) {
		exec('command', function (error, stdout, stderr) {
            console.log(script);
			console.log(stderr);
		});
	}
};