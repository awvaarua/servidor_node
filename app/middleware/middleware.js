var fs = require('fs');
var Nodo = require('../operations/nodos');
module.exports = {

	isLoggedIn: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	},

	isAdmin: function (req, res, next) {
		if (req.user.local.admin == true) {
			return next();
		}
		res.redirect('/login');
	},

	macConfig: function (req, res, next) {
		if (req.params.mac == "req") {
			var ip = req.ip.split(':');
			req.params.mac = mac[mac.length - 1];
		}
		return next();
	},

	getIp: function (req, res, next) {
		var ip = req.ip.split(':');
		req.params.ip = ip[ip.length - 1];
		return next();
	},

	fileExistAndRemove: function (req, res, next) {
		try {
			var tmp_path = req.file.path;
			var target_path = './uploads/' + req.file.filename;
			fs.access(target_path, fs.R_OK | fs.W_OK, function (err) {
				if(!err){
					fs.unlink(tmp_path, function() {
						res.send({
							ok: "false",
							error: "El fichero ya existe. Cambia el nombre."
						});
					});
				}else{
					fs.rename(tmp_path, target_path, function(err) {
						if (err) throw err;
							fs.unlink(tmp_path, function() {
								next();
							});
					});
				}
			});	
		} catch (error) {
			
		}		
	},

	removeFileIfError: function (req, res, next) {
		try {
			var path = './uploads/' + req.body.fichero;
			fs.unlink(path);
			res.send({
				ok: "false",
				error: req.body.err
			});	
		} catch (error) {	
		}
	},

	removeFile: function (req, res, next) {
		try {
			var path = './uploads/' + req.body.fichero;
			fs.unlink(path);
		} catch (error) {	
		}
	},

	checkNewIp: function(req, res, next){
		var ip = req.ip.split(':');
		req.params.ip = ip[ip.length - 1];
		Nodo.GetNodo(req.params.mac, function(err, nodo){
			if(err || !nodo){
				return next();
			}
			if(nodo.ip != req.params.ip){
				nodo.ip = req.params.ip;
				nodo.save(function () {
					return next();
				});
			}else{
				return next();
			}
		});
	}

};