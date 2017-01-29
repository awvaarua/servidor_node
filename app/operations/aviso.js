var Aviso = require('../models/aviso');

var self = module.exports = {

    AddAviso: function (aviso, callback) {
        var aviso = new Aviso({
            fecha: new Date(),
            mensaje: aviso.mensaje
        });
        aviso.save(function (err) {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    },

    GetAvisosAfterDate: function (date, callback) {
        Aviso.find({}, function (err, avisos) {
            if (err) {
                return callback(err);
            }
            var listado = [];            
            avisos.forEach(function (aviso) {                
                if(aviso.fecha >= date){
                    listado.push(aviso);
                }                
            });
            callback(null, listado);
        })
    }

};