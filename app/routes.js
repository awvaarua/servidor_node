module.exports = function(app) {

    var md = require('./middleware/middleware');

    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'temp/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    });
    var upload = multer({ storage: storage });
    var actions = require('./routes/actions');

    
    app.post('/action/start', md.isAuthorized, actions.start);
    app.post('/action/file', md.isAuthorized, upload.single( 'file' ), actions.file);
    app.post('/action/script/status/:pid', md.isAuthorized, actions.scriptStatus);

    app.post('/status', md.isAuthorized, upload.single( 'file' ), actions.status);

};