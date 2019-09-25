const headerResponse = require("../../util/headerResponse");

exports.insertRow = function(req, res) {
  console.log("BEGIN INSERT ROW");
  var tabla = req.params.tabla;
  var modelo = require("../models/" + tabla);

  if (typeof modelo == "undefined") res.send("MODELO IS UNDEFINED");

  var modeloConfiged = new modelo(req.body);

  res.writeHead(200, headerResponse);
  modeloConfiged
    .save()
    .then(doc => {
      res.write("Guardado :" + doc);
    })
    .catch(err => {
      res.write(err);
    })
    .finally(err => {
      res.end();
    });
};

exports.getAll = function(req, res) {
  var tabla = req.params.tabla;
  var modelo = require("../models/" + tabla);

  res.writeHead(200, headerResponse);
  modelo
    .find()
    .then(doc => {
      res.write(JSON.stringify(doc));
    })
    .catch(err => {
      res.write(err);
    })
    .finally(fin => {
      res.end();
    });
};

exports.getRow = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  var modelo = require("../models/" + tabla);

  res.writeHead(200, headerResponse);
  modelo
    .findById(id)
    .then(doc => {
      res.write(JSON.stringify(doc));
    })
    .catch(err => {
      res.write(err);
    })
    .finally(fin => {
      res.end();
    });
};

exports.getOne = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  var columna = req.params.columna;
  var modelo = require("../models/" + tabla);

  res.writeHead(200, headerResponse);
  modelo
    .findById(id)
    .then(doc => {
      res.write(JSON.stringify(doc[columna]));
    })
    .catch(err => {
      res.write(err);
    })
    .finally(fin => {
      res.end();
    });
};

exports.getCol = function(req, res) {
    var tabla = req.params.tabla;
    var columna = req.params.columna;
    var modelo = require("../models/" + tabla);

    res.writeHead(200, headerResponse);
    modelo
      .find({},columna)
      .then(doc => {
        res.write(JSON.stringify(doc));
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
