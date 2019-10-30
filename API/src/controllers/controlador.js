const headerResponse = require("../../util/headerResponse");

exports.get = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  //La idea es en query mandar un string columnas = "nombre apellido1 apellido2" asi se lo incrusto directo a la query
  var strColumnas = req.query.columnas;
  var objFilter = req.query.filtros;
  var modelo = require("../models/" + tabla);
  if (typeof id == "undefined") {
    modelo
      .find(objFilter, strColumnas)
      .then(doc => {
        res.writeHead(200, headerResponse);
        res.write(JSON.stringify(doc));
      })
      .catch(err => {
        res.writeHead(500, headerResponse);
        res.write(err);
      })
      .finally(fin => {
        res.end();
      });
  } else {
    modelo
      .findById(id, strColumnas)
      .then(doc => {
        res.writeHead(200, headerResponse);
        res.write(JSON.stringify(doc));
      })
      .catch(err => {
        res.writeHead(500, headerResponse);
        res.write(err);
      })
      .finally(fin => {
        res.end();
      });
  }
};

exports.insert = function(req, res) {
  console.log("BEGIN INSERT ROW");
  console.log(req.body);
  var tabla = req.params.tabla;
  var modelo = require("../models/" + tabla);

  if (typeof modelo == "undefined") res.send("MODELO IS UNDEFINED");

  var modeloConfiged = new modelo(req.body);

  
  modeloConfiged
    .save()
    .then(doc => {
      res.writeHead(200, headerResponse);
      res.write("Guardado :" + doc);
    })
    .catch(err => {
      res.write(err);
    })
    .finally(err => {
      res.end();
    });
};

exports.update = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  var modelo = require("../models/" + tabla);

  res.writeHead(200, headerResponse);
  modelo
    .findByIdAndUpdate(id, req.body)
    .then(doc => {
      res.write("Updated");
    })
    .catch(err => {
      res.write(err);
    })
    .finally(fin => {
      res.end();
    });
};

exports.delete = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  var modelo = require("../models/" + tabla);

  res.writeHead(200, headerResponse);
  modelo
    .deleteOne({ _id: id })
    .then(doc => {
      res.write("DELETED");
    })
    .catch(err => {
      res.write(err);
    })
    .finally(fin => {
      res.end();
    });
};

//Funcion para ver si el server esta en linea
exports.inicio = function(req, res) {
  console.log("Solicitud recibida");
  res.writeHead(200, headerResponse);
  res.write("Solicitud recibida");
  res.end();
};
