var TelegramBot = require('node-telegram-bot-api');
var Usuario = require('../models/usuario');
var Nodos = require('../operations/nodos');
var Ssh = require('../ssh_operations/sshoperations.js');
var token = '161755617:AAEkQY8R5qcMjQJAtCZ9NIiQFmJUDS_87R8';
var bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, function (msg, match) {
    AddUser(msg.from.username, msg.from.id, function (err) {
        if (err) {
            self.SendTelegram("Lo sentimos, se ha producido un error: " + err, [msg.from.username], {});
        } else {
            self.SendTelegram("Usuario añadido correctamente", [msg.from.username], {});
        }
    });
});

bot.onText(/\/estado/, function (msg, match) {
    Nodos.GetAllNodes(function (err, nodos) {
        if (err || !nodos) {
            nodos = [];
        }
        var keyboard = [];
        nodos.forEach(function (nodo) {
            keyboard.push([{
                text: nodo.nombre + ' - ' + nodo.mac,
                callback_data: "/estado " + nodo.mac
            }]);
        });
        var opt = {
            reply_markup: {
                hide_keyboard: true,
                inline_keyboard: keyboard
            }
        };
        self.SendTelegram("Selecciona un nodo", [msg.from.username], opt);
    });
});

bot.onText(/\/set/, function (msg, match) {
    Nodos.GetAllNodes(function (err, nodos) {
        if (err || !nodos) {
            nodos = [];
        }
        var keyboard = [];
        nodos.forEach(function (nodo) {
            keyboard.push([{
                text: nodo.nombre + ' - ' + nodo.mac,
                callback_data: "/set " + nodo.mac
            }]);
        });
        var opt = {
            reply_markup: {
                hide_keyboard: true,
                inline_keyboard: keyboard
            }
        };
        self.SendTelegram("Selecciona un nodo", [msg.from.username], opt);
    });
});

bot.on("callback_query", function (callbackQuery) {
    var opt = { chat_id: callbackQuery.message.chat.id, message_id: callbackQuery.message.message_id }
    try {
        var data = callbackQuery.data.split(" ")
        var accion = data[0];
        var mac = data[1];
    } catch (error) {
        return self.UpdateMessage("Formato de mensaje incorrecto", opt);
    }
    if (accion == "/estado") {
        EstadoAction(mac, opt);
    } else if (accion == "/set") {
        SetAction(mac, opt);
    } else if (accion == "/getactions") {
        var fichero = data[2];   
        GiveOptions(mac, fichero, opt);
    } else if (accion == "/action") {
        var fichero = data[2];
        var accion = data[3];
        Action(mac, fichero, accion, opt);
    }
});

var self = module.exports = {
    SendTelegram: function (mensaje, usuarios, options) {
        usuarios.forEach(function (usuario) {
            GetUserByAlias(usuario, function (err, user) {
                if (!err && user) {
                    bot.sendMessage(user.user_id, mensaje, options);
                }
            });
        });
    },

    UpdateMessage: function (texto, options) {
        bot.editMessageText(texto, options);
    },

    SendVideo: function (nombre_fichero, mensaje, usuarios, options) {
        usuarios.forEach(function (usuario) {
            GetUserByAlias(usuario, function (err, user) {
                if (!err && user) {
                    bot.sendMessage(user.user_id, mensaje, options);
                    bot.sendVideo(user.user_id, './temp/'+nombre_fichero);
                }
            });
        });
    },

    UpdateMessage: function (texto, options) {
        bot.editMessageText(texto, options);
    }
}

function AddUser(username, id, callback) {
    Usuario.update({
        alias: username
    }, {
            alias: username,
            user_id: id
        }, { upsert: true },
        function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
}

function GetUserByAlias(alias, callback) {
    alias = alias.replace('@', '');
    Usuario.findOne({
        alias: alias
    }, function (err, user) {
        if (err) {
            callback(err);
        }
        callback(null, user);
    });
}

function EstadoAction(mac, opt) {
    self.UpdateMessage("\n \u{1F504} Cargando \n", opt);
    Nodos.GetNodo(mac, function (err, nodo) {
        if (err || !nodo) {
            return self.UpdateMessage("El nodo no se ha podido recuperar", opt);
        }
        var msg = "Información del nodo: " + nodo.nombre + "\n";
        Ssh.CheckNodeStatus(nodo.ip, function (status) {
            if (status == "offline") {
                msg += "       Estado: \u{274C} Offline\n";
                return self.UpdateMessage(msg, opt);
            } else {                
                msg += "       Estado: \u{2705} Online\n       Lista de scripts:\n";
                //Bucle recursiu
                if(!nodo.scripts.length){
                    return self.UpdateMessage(msg, opt);
                }
                Ssh.CheckScriptsRecursive(nodo.ip, nodo.scripts, 0, [], function (err, info) {
                    if (err) {
                        return self.UpdateMessage(err, opt);
                    }
                    info.forEach(function (script) {
                        if (script.estado == "offline") {
                            msg += "              " + script.nombre + " \u{274C} Parado\n";
                        } else {
                            msg += "              " + script.nombre + " \u{2705} En ejecución\n";
                        }
                    });
                    self.UpdateMessage(msg, opt);
                });
            }
        });
    });
}

function SetAction(mac, opt) {
    self.UpdateMessage("\n \u{1F504} Cargando \n", opt);
    Nodos.GetNodo(mac, function (err, nodo) {
        if (err || !nodo) {
            return self.UpdateMessage("El nodo no se ha podido recuperar", opt);
        }
        var msg = "Seleccione un script\n";
        if(!nodo.scripts.length){
            return self.UpdateMessage("Este nodo no tiene scripts", opt);
        }
        var keyboard = [];
        nodo.scripts.forEach(function (script) {
            keyboard.push([{
                text: script.nombre,
                callback_data: "/getactions " + nodo.mac + " "+script.fichero
            }]);
        });
        opt.reply_markup = {
                hide_keyboard: true,
                inline_keyboard: keyboard
            }
        self.UpdateMessage(msg, opt);
    });
}

function GiveOptions(mac, fichero, opt) {
    console.log(fichero);
    self.UpdateMessage("\n \u{1F504} Cargando \n", opt);
    Nodos.GetNodo(mac, function (err, nodo) {
        if (err || !nodo) {
            return self.UpdateMessage("El nodo no se ha podido recuperar", opt);
        }
        if(!nodo.scripts.length){
            return self.UpdateMessage("Este nodo no tiene scripts", opt);
        }
        nodo.scripts.forEach(function(script){
            if(script.fichero == fichero){
                Ssh.CheckScriptStatus(nodo.ip, script.pid, function(err, estado){
                    if(err){
                        return self.UpdateMessage("Error al recuperar el estado del script", opt);
                    }else if(estado == "online"){
                        opt.reply_markup = {
                            hide_keyboard: true,
                            inline_keyboard: [[{text: "Apagar", callback_data:"/action "+mac+" "+fichero+" off"}]]
                        }
                        return self.UpdateMessage(script.nombre, opt);
                    }else if(estado == "offline"){
                        opt.reply_markup = {
                            hide_keyboard: true,
                            inline_keyboard: [[{text: "Encender", callback_data:"/action "+mac+" "+fichero+" on"}]]
                        }
                        return self.UpdateMessage(script.nombre, opt);
                    }
                });
            }
        });
    });
}

function Action(mac, fichero, action, opt) {
    console.log(action);
    self.UpdateMessage("\n \u{1F504} Cargando \n", opt);
    Nodos.GetNodo(mac, function (err, nodo) {
        if (err || !nodo) {
            return self.UpdateMessage("El nodo no se ha podido recuperar", opt);
        }
        if(!nodo.scripts.length){
            return self.UpdateMessage("Este nodo no tiene scripts", opt);
        }
        nodo.scripts.forEach(function(script){
            if(script.fichero == fichero){
                if(action == "on"){
                    Encender(nodo.ip, script, function(err, pid){
                        if(err){
                            return self.UpdateMessage("Error al iniciar", opt);
                        }
                        script.pid = pid;
                        nodo.save();
                        return self.UpdateMessage("Encendido!!", opt);
                    });
                }else{
                    Apagar(nodo.ip, script, function(err){
                        if(err){
                            return self.UpdateMessage("Error al parar", opt);
                        }
                        return self.UpdateMessage("Apagado!!", opt);
                    });
                }
            }
        });
    });
}

function Encender(ip, script, callback){
    Ssh.StartScript(ip, script, function(err, pid){
        if(err){
            return callback("Error al iniciar el script");
        }
        callback(null, pid);
    });
}

function Apagar(ip, script, callback){
    Ssh.StopScript(ip, script.pid, function(err){
        callback(err);
    });
}