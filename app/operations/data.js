var Data = require('../models/data.js');

var self = module.exports = {

	Add: function (mac, fichero, valor) {
		self.Get(mac, fichero, function (err, data) {			
			if(err){
				return;
			}
			if (!data) {			
				var data = new Data({
					mac: mac,
					fichero: fichero,
					valores: []
				});
				data.valores.push({
					valor: valor,
					date: new Date()
				});
				data.save();
			}else{
				data.valores.push({
					valor: valor,
					date: new Date()
				});
				data.save();
			}
		});
	},

	Get: function (mac, fichero, callback) {
		var query = {
			mac: mac,
			fichero: fichero
		};
		Data.findOne(query, function (err, data) {
			if (err ||  !data) {
				return callback(err);
			}
			callback(null, data);
		});
	}

};