var Alerta = require('../models/alerta');
var Aviso = require('../operations/aviso');
var Accion = require('../operations/accion.js');
var Nodo = require('../operations/nodos.js');

var self = module.exports = {

    AddAlerta: function (alerta, callback) {
        var alert = new Alerta({
            nodo: {
                mac: parseInt(alerta.mac),
                nombre: alerta.nombre
            },
            fichero: alerta.fichero,
            mensaje: alerta.mensaje,
            usuarios: alerta.usuarios,
            tipo: parseInt(alerta.tipo),
            acciones: alerta.acciones ? alerta.acciones : []
        });
        if (parseInt(alerta.tipo) == 1) {
            alert.condicion = alerta.condicion;
            (parseFloat(alerta.valorone)) ? alert.valorone =  parseFloat(alerta.valorone) : "Nodo no encontrado"
            if(!isNaN(parseFloat(alerta.valorone))){
                alert.valorone =  parseFloat(alerta.valorone);
            }
            if(!isNaN(parseFloat(alerta.valortwo))){
                alert.valortwo =  parseFloat(alerta.valortwo);
            }
            //alert.valorone =  parseFloat(alerta.valorone) || 0;
            //alert.valortwo =  parseFloat(alerta.valortwo) || 0;
            alert.frecuencia = parseInt(alerta.frecuencia);
        }
        if(!alerta.usuarios){
            alert.usuarios = [];
        }
        alert.save(function (err) {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    },

    UpdateAlerta: function (alerta, cambios, callback) {
        alerta.mensaje = cambios.mensaje;
        if(!cambios.usuarios){
            alerta.usuarios = [];
        }else{
            alerta.usuarios = cambios.usuarios;
        }
        if(!cambios.acciones){
            alerta.acciones = [];
        }else{
            alerta.acciones = cambios.acciones;
        }
        if (parseInt(alerta.tipo) == 1) {
            alerta.condicion = cambios.condicion;
            alerta.frecuencia = parseInt(cambios.frecuencia);
            if(!isNaN(parseFloat(cambios.valorone))){
                alerta.valorone =  parseFloat(cambios.valorone);
            }
            if(!isNaN(parseFloat(cambios.valortwo))){
                alerta.valortwo =  parseFloat(cambios.valortwo);
            }
        }
        alerta.save(function(err){
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    },

    GetAlerta: function (mac, fichero, callback) {
        Alerta.find({
            "nodo.mac": parseInt(mac),
            fichero: fichero
        }, function (err, alerta) {
            if (err) {
                return callback(err);
            }
            callback(null, alerta);
        });
    },

    GetAlertaById: function (id, callback) {
        Alerta.findById(id, function (err, alerta) {
            if (err) {
                return callback(err);
            }
            callback(null, alerta);
        });
    },

    GetAllAlertas: function (callback) {
        Alerta.find({}, function (err, alertas) {
            if (err) {
                return callback(err);
            }
            var listado = [];
            alertas.forEach(function (alerta) {
                listado.push(alerta);
            });
            callback(null, listado);
        })
    },

    RemoveAlerta: function (id, callback) {
        Alerta.remove({
            _id: id
        }, function (err) {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    },

    Check: function (mac, fichero, valor) {
        self.GetAlerta(mac, fichero, function (err, alertas) {
            if (err || !alertas) {
                return;
            }
            Nodo.GetNodo(mac, function (err, nodo) {
                if (err || !nodo) {
                    return;
                }   
                alertas.forEach(function (alerta) {
                    Actuar(nodo, alerta, valor);
                });
            });
        });
    },

    CheckVideo: function (mac, fichero, nombre_fichero, valor) {
        self.GetAlerta(mac, fichero, function (err, alertas) {
            if (err || !alertas) {
                return;
            }
            Nodo.GetNodo(mac, function (err, nodo) {
                if (err || !nodo) {
                    return;
                }
                alertas.forEach(function (alerta) {
                    ActuarVideo(nodo, alerta, valor, nombre_fichero);
                });
            });
        });
    }
}

function ActuarVideo(nodo, alerta, valor, nombre_fichero) {
    switch (alerta.tipo) {
        case 1:
            return CheckAlerta(nodo, alerta, valor, function(){
                Accion.SendVideo(nombre_fichero, CreateMensaje(nodo, alerta, valor), alerta.usuarios)
                EjecutarAcciones(alerta, valor);
            });
        case 2:
            Accion.SendVideo(nombre_fichero, CreateMensaje(nodo, alerta, valor), alerta.usuarios)
            EjecutarAcciones(alerta, valor);
        default:
            break;
    }
};

function Actuar(nodo, alerta, valor) {
    switch (alerta.tipo) {
        case 1:
            return CheckAlerta(nodo, alerta, valor, function(){
                Avisar(nodo, alerta, valor);
                return EjecutarAcciones(alerta, valor);
            });
        case 2:
            Avisar(nodo, alerta, valor);
            return EjecutarAcciones(alerta, valor);
        default:
            break;
    }
};

function EjecutarAcciones(alerta, valor) {
    if(!alerta || !alerta.acciones){
        return;
    }
    alerta.acciones.forEach(function(accion, idx){
        Nodo.GetNodo(accion.mac, function(err, nodo){
            if(!err && nodo){
                var script = {
                    nombre: accion.script.nombre,
                    fichero: accion.script.fichero,
                    argumentos: accion.script.argumentos
                };
                Nodo.AddScript(nodo, script, function(err){});
            }            
        });
    });
}

function CheckAlerta(nodo, alerta, valor, callback) {
    if (CheckCondition(valor, alerta)) {
        if (CheckDate(alerta)) {
            callback();
        }
    }
}

function Avisar(nodo, alerta, valor){
    Informar(nodo, alerta, valor);
    Aviso.AddAviso({
        mensaje: CreateMensaje(nodo, alerta, valor)
    }, function(){});
}

function Informar(nodo, alerta, valor) {
    mensaje = CreateMensaje(nodo, alerta, valor);
    Accion.SendTelegram(mensaje, alerta.usuarios);
}

function CheckCondition(val_dato, alerta) {
    switch (alerta.condicion) {
        case ">":
            if (val_dato > alerta.valorone) {
                return true;
            }
            return false;
        case ">=":
            if (val_dato >= alerta.valorone) {
                return true;
            }
            return false;
        case "<":
            if (val_dato < alerta.valorone) {
                return true;
            }
            return false;
        case "<=":
            if (val_dato <= alerta.valorone) {
                return true;
            }
            return false;
        case "=":
            if (val_dato == alerta.valorone) {
                return true;
            }
            return false;
        case "entre":
            if (alerta.valorone <= val_dato && val_dato <= alerta.valortwo) {
                return true;
            }
            return false;
        case "fuera":
            if (val_dato <= alerta.valorone && val_dato >= alerta.valortwo) {
                return true;
            }
            return false;
        default:
            return false;
    }
}

function CheckDate(alerta) {
    if (typeof alerta.last_event === 'undefined') {
        alerta.last_event = new Date();
        alerta.save();
        return true;
    }
    var now = new Date();
    var diffMs = (now - alerta.last_event);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    if (diffMins >= alerta.frecuencia) {
        alerta.last_event = now;
        alerta.save();
        return true;
    }
    return false;
}

function CreateMensaje(nodo, alerta, valor) {
    var msg = "\u{2757}\u{2757}\u{2757}" + alerta.mensaje.replace(":nombre", nodo.nombre);
    msg = msg.replace(":valor", valor);
    return msg;
}