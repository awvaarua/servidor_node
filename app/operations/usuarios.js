var Usuario = require('../models/usuario');

var self = module.exports = {

  GetUsers: function(callback) {
    Usuario.find({}, function(err, users) {
      if (err) {
        callback(err);
      }
      var userlist = [];
      users.forEach(function(user) {
        userlist.push(user);
      });
      callback(null, userlist);
    });
  }

};