const headerResponse = require("../../util/headerResponse");
const fs = require("fs");

exports.get = function(req, res) {
  var tabla = req.params.tabla;
  var id = req.params.id;
  //La idea es en query mandar un string columnas = "nombre apellido1 apellido2" asi se lo incrusto directo a la query
  var strColumnas = req.query.columnas;
  var objFilter;
  if (typeof req.query.filtros != "undefined") {
    objFilter = JSON.parse(req.query.filtros);
  }
  var modelo = require("../models/" + tabla);
  if (typeof id == "undefined") {
    modelo
      .find(objFilter, strColumnas)
      .then(doc => {
        if (doc.length == 0) {
          res.writeHead(200, headerResponse);
          res.write("Vacio");
        } else {
          res.writeHead(200, headerResponse);
          res.write(JSON.stringify(doc));
        }
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

exports.postAvatar = (req, res) => {
  var idAvatar = req.params.id;
  var avatarBase64 = req.body.avatarB64.replace(/^data:image\/png;base64,/, "");
  var avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\avatares\\" +
    idAvatar +
    ".png";
  try {
    fs.writeFileSync(avatarDirPath, avatarBase64, "base64");

    res.writeHead(200, headerResponse);
    res.write("Image posted");
  } catch (error) {
    res.writeHead(500, headerResponse);
    res.write(error);
  } finally {
    res.end();
  }
};

exports.getAvatar = (req, res) => {
  var idAvatar = req.params.id;
};

//Funcion para ver si el server esta en linea
exports.inicio = function(req, res) {
  console.log("Solicitud recibida");
  res.writeHead(200, headerResponse);
  res.write("Solicitud recibida");
  res.end();
};
