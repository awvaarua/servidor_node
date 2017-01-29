var Pendiente = require('../models/pendiente');

var self = module.exports = {

  GetPendientes: function(callback) {
    Pendiente.find({}, function(err, pendientes) {
      if (err) {
        callback(err);
      }
      var listapendientes = [];
      pendientes.forEach(function(pendiente) {
        listapendientes.push(pendiente);
      });
      callback(null, listapendientes);
    });
  },

  InsertPendiente: function(ip, mac, callback) {
    Pendiente.collection.insert({
      ip: ip,
      mac: parseInt(mac),
      date: new Date()
    }, function(err) {
      if (err) {
        callback(err);
      }
      callback(null);
    });
  },

  GetPendiente: function(mac, callback) {
    Pendiente.findOne({
      mac: parseInt(mac)
    }, function(err, obj) {
      if (err) {
        callback(err);
      }
      console.log(obj)
      callback(null, obj);
    });
  },

  DeletePendiente: function(mac, callback) {
    Pendiente.remove({
      mac: parseInt(mac)
    }, function(err) {
      if (err) {
        callback(err);
      }
      callback(null);
    });
  }
};