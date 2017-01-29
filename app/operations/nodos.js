var Nodo = require('../models/nodo');
var Pendientes = require('./pendientes.js');
var Ssh = require('../ssh_operations/sshoperations.js');

var self = module.exports = {

  //Devuelve todos los nodos en un array
  GetAllNodes: function (callback) {
    Nodo.find({}, 'nombre ip mac', function (err, nodos) {
      if (err) {
        callback(err, null);
      }
      var listado = [];
      nodos.forEach(function (nodo) {
        listado.push(nodo);
      });
      callback(null, listado);
    });
  },

  //Devuelve un nodo
  GetNodo: function (mac, callback) {
    try {
      mac = parseInt(mac);
    } catch (error) {
      callback(err, null);
    }
    Nodo.findOne({
      mac: mac
    }, function (err, nodo) {
      if (err) {
        callback(err, null);
        return;
      }
      try {
        nodo.methods.sort();
      } catch (err) { }
      callback(null, nodo);
    });
  },

  //Elimina un nodo, eliminando antes todos los scripts
  DeleteNodo: function (mac, callback) {
    self.GetNodo(mac, function (err, nodo) {
      if (err) {
        return callback(err, null);
      }
      self.DeleteAllScripts(mac, nodo.ip, nodo.scripts, 0, [], function (err, data) {
        if (err) {
          return callback(err, null);
        }
        Nodo.remove({
          mac: parseInt(mac)
        }, function (err) {
          if (err) {
            callback(err, null);
          }
          callback(null, data);
        });
      });
    });
  },

  //Recorre recursivamente todos los scripts
  DeleteAllScripts: function (mac, ip, scripts, index, info_array, callback) {
    if (index < scripts.length) {
      self.DeleteScript(mac, ip, scripts[index].pid, function (err, data) {
        if (err) {
          callback(err, data);
        }
        info_array.push(data);
        self.DeleteAllScripts(mac, ip, scripts, index + 1, info_array, callback);
      });
    } else {
      callback(null, info_array);
    }
  },

  //Elimina el script dentro del nodo
  DeleteScript: function (mac, ip, pid, callback) {
    Ssh.StopScript(ip, pid, function (err, data) {
      if (err) {
        callback(err);
      }
      Nodo.collection.update({
        mac: parseInt(mac)
      }, {
          $pull: {
            scripts: {
              pid: parseInt(pid)
            }
          }
        }, function (err) {
          if (err) {
            callback(err);
          }
          callback(null, data);
        });
    });
  },

  //Inicia el script en el nodos i lo guarda en BBDD.
  AddScript: function (nodo, script, callback) {
    if(!script.argumentos){
      script.argumentos = [];
    }
    Ssh.StartScript(nodo.ip, script, function (err, pid) {
      if (err) {
        return callback(err);
      }
      script.pid = pid;
      script.argumentos.forEach(function (arg) {
        arg.orden = parseInt(arg.orden);
      });
      nodo.scripts.push(script);
      nodo.save(function (err) {
        if (err) {
          return callback(err);
        }
        callback();
      });
    });
  },

  //Añade un nodo en la BBDD
  AddNode: function (data, callback) {
    var nodo = new Nodo({
      ip: data.ip,
      nombre: data.nombre,
      descripcion: data.descripcion,
      mac: parseInt(data.mac),
      scripts: [],
      date: new Date()
    });
    nodo.save(function (err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  },

  //Actualiza un determinado script
  UpdateScript: function (mac, pid, cambio, callback) {
    self.GetNodo(mac, function (err, nodo) {
      if (err) {
        return callback(err, null);
      }
      Update(nodo, pid, cambio, function (err, script) {
        if (err) {
          return callback(err);
        }
        callback(null, script);
      })
    });
  }

};

//Metodo privado para llevar a cabo la actualización
function Update(nodo, pid, change, callback) {
  switch (change.tipo) {

    case "pid":

      nodo.scripts.forEach(function (script) {
        if (script.pid == parseInt(pid)) {
          script.pid = parseInt(change.valor);
          return nodo.save(callback(null, script));
        }
      });
      break;

    case "argumentos":

      nodo.scripts.forEach(function (script) {
        if (script.pid == parseInt(pid)) {
          script.argumentos.forEach(function (arg) {
            if (arg.orden == parseInt(change.orden)) {
              arg.valor = change.valor;
              return nodo.save(callback(null, script));
            }
          });
        }
      });
      break;

    default:
      callback("Tipo no encontrado");
  }
}