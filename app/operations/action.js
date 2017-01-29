var exec = require('child_process').exec;

module.exports = {

	start: function (script, callback) {
		var args = '';
		if (!script.argumentos) script.argumentos = [];
		try{
			script.argumentos.forEach(function(arg){
				args += arg.valor+" ";
			});
		}catch(e){}
		
		var cmd = 'nohup python /home/pi/servidor_node/temp/'+ script.fichero +' '+ args + ' > /dev/null 2>&1 & echo $!';
		exec(cmd, function (error, stdout, stderr) {
			console.log("error "+error);
			console.log("stderr "+stderr);
			if (error || stderr) {
				return callback(error ? error : stderr);
			}
			return callback(null, stdout);
		});
	},

	scriptStatus: function (pid, callback) {
		
		var cmd = 'kill -0 '+pid;
		exec(cmd, function (error, stdout, stderr) {
			if (error) {
				return callback(null, 'offline');
			}
			return callback(null, 'online');
		});
	},

	stopScript: function (pid, callback) {
		
		var cmd = 'kill '+pid;
		exec(cmd, function (error, stdout, stderr) {
			if (error) {
				return callback(null, pid);
			}
			return callback(null, pid);
		});
	},

	restartNode: function () {
		var cmd = 'sudo reboot now';
		exec(cmd);
	}
};