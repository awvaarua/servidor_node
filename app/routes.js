module.exports = function(app, passport) {

    var md = require('./middleware/middleware');

    var users = require('./routes/actions');
    app.post('/action/start', md.isAuthorized, actions.start);

};