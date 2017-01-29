var User = require('../models/user');

var self = module.exports = {

  GetUsers: function(callback) {
    User.find({}, function(err, users) {
      if (err) {
        callback(err);
      }
      var userlist = [];
      users.forEach(function(user) {
        userlist.push(user);
      });
      callback(null, userlist);
    });
  },

  DeleteUserByEmail: function(email, callback) {
    User.remove({
      "local.email": email
    }, function(err) {
      callback(null);
    });
  },

  UpdateUser: function(email, tipo, callback) {
    User.update({
      "local.email": email
    }, {
      "local.admin": tipo
    }, function(err) {
      if (err) {
        callback(err);
      }
      callback(null);
    });
  }

};