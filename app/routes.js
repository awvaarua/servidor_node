module.exports = function(app, passport) {

    var md = require('./middleware/middleware');

    var users = require('./routes/users');
    app.get('/users', md.isLoggedIn, md.isAdmin, users.users);
    app.post('/user/update', md.isLoggedIn, md.isAdmin, users.userUpdate);
    app.post('/user/unlink', md.isLoggedIn, md.isAdmin, users.userDelete);

    var pendientes = require('./routes/pendientes');
    app.get('/pendiente/add/:mac', md.getIp, pendientes.pendienteAdd);
    app.get('/pendiente/:mac/render', pendientes.pendienteRender);
    app.get('/pendiente/:mac', pendientes.pendiente);
    app.post('/pendiente/:mac/remove', md.isLoggedIn, pendientes.pendienteDelete);
    app.get('/pendientes/', md.isLoggedIn, pendientes.pendientes);
    app.get('/pendientes/count', md.isLoggedIn, pendientes.pendientesCount);

    var nodes = require('./routes/nodos');
    app.post('/nodo/add', md.isLoggedIn, nodes.nodeAdd);
    app.get('/nodo/:mac', md.isLoggedIn, nodes.node);
    app.get('/nodos/render', md.isLoggedIn, nodes.nodesRender);
    app.get('/nodos/', md.isLoggedIn, nodes.nodes);
    app.get('/nodo/:mac/starting', md.checkNewIp, nodes.nodeScripts);
    app.get('/nodo/:mac/status', md.isLoggedIn, nodes.nodeStatus);
    app.post('/nodo/:mac/delete', md.isLoggedIn, nodes.nodeDelete);
    app.post('/nodo/:mac/restart', md.isLoggedIn, nodes.nodeRestart);
    app.post('/nodo/:mac/pendiente', md.isLoggedIn, nodes.nodePendiente);
    app.get('/nodo/:mac/scripts', nodes.nodeScripts);
    app.get('/nodo/:mac/script/:pid/status', md.isLoggedIn, nodes.scriptStatus);
    app.get('/nodo/:mac/script/:pid/start', nodes.scriptStart);
    app.post('/nodo/:mac/script/:pid/delete', md.isLoggedIn, nodes.scriptDelete);
    app.post('/nodo/:mac/script/:pid/update', nodes.scriptUpdate);
    app.post('/nodo/:mac/script/add', md.macConfig, nodes.scriptAdd);

    var alertas = require('./routes/alertas');
    app.get('/alerts/', md.isLoggedIn, alertas.alertsGet);
    app.get('/alerta/add', md.isLoggedIn, alertas.alertaAddView);
    app.post('/alerta/add', md.isLoggedIn, alertas.alertAdd);
    app.post('/alerta/:id/update', md.isLoggedIn, alertas.alertUpdate);
    app.post('/alerta/:id/remove', md.isLoggedIn, alertas.alertRemove);

    var scripts = require('./routes/scripts');
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'temp/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage });
    app.get('/scripts/', md.isLoggedIn, scripts.scriptsGet);
    app.get('/script/add', md.isLoggedIn, scripts.scriptsAddView);
    app.post('/script/add', md.isLoggedIn, scripts.scriptAdd, md.removeFileIfError);
    app.post('/script/:id/delete', md.isLoggedIn, scripts.scriptRemove, md.removeFile);
    app.post('/script/file/upload/', md.isLoggedIn, upload.single( 'file' ), md.fileExistAndRemove, scripts.fileUpload);
    app.get('/script/:id', md.isLoggedIn, scripts.scriptGet);
    app.get('/script/:id/render/:posicion', md.isLoggedIn, scripts.scriptRender);
    app.get('/script/:id/renderAccion/:mac/:posicion/:tipo', md.isLoggedIn, scripts.scriptRenderAction);

    var data = require('./routes/data');
    app.post('/data/add', md.getIp, data.dataAdd);
    app.post('/data/:mac', md.getIp, data.dataGet);
    app.post('/data/:mac/video', md.getIp, upload.single( 'file' ), data.dataAddVideo);

    var usuario = require('./routes/usuarios');
    app.get('/usuarios/', md.isLoggedIn, usuario.usuarios);
    
    var aviso = require('./routes/avisos');
    app.post('/avisos/date', md.isLoggedIn, aviso.avisosGetAfterDate);

    // =============================================================================
    //  ADMIN PANE =================================================================
    // =============================================================================

    app.get('/', md.isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            user: req.user
        });
    });

    app.get('/admin', md.isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            user: req.user
        });
    });

    // =============================================================================
    // AUTHENTICATE ================================================================
    // =============================================================================

    // LOGIN ===============================
    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // LOGIN SEND =================================
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // SIGNUP =================================
    app.get('/signup', md.isLoggedIn, md.isAdmin, function(req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage'),
            messageOk: req.flash('signupMessageOk')
        });
    });

    // SIGNUP SEND =================================
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/user/success',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // LOGOUT =================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    // =============================================================================
    // PUBLIC IMAGES ===============================================================
    // =============================================================================    
    // RETURN IMAGE =========================
    var fs = require('fs');
    app.get('/public/img/:name', function(req, res) {
        var img = fs.readFileSync('./public/img/' + req.params.name);
        res.writeHead(200, {
            'Content-Type': 'image/gif'
        });
        res.end(img, 'binary');
    });
};