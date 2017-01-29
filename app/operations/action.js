var exec = require('child_process').exec;

module.exports = {

	start: function (script, callback) {
		var args = '';
		script.argumentos.forEach(function(arg){
          args += arg.valor+" ";
        });
		var cmd = 'nohup python /Users/ssb/Desktop/'+ script.fichero +' '+ args + ' > /dev/null 2>&1 & echo $!';
		exec(cmd, function (error, stdout, stderr) {
			if (error || stderr) {
				return callback(error ? error : stderr);
			}
			return callback(null, stdout);
		});
	}
};