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

exports.postImage = (req, res) => {
  var idImage = req.params.id;
  var imageBase64 = req.body.imageB64.split(",")[1];
  var formatBase64 = imageBase64.charAt(0);

  switch (formatBase64) {
    case "/":
      formatBase64 = ".jpg";
      break;
    case "i":
      formatBase64 = ".png";
      break;
    case "R":
      formatBase64 = ".gif";
      break;
    default:
      res.writeHead(500, headerResponse);
      res.write("imagen no compatible");
      res.end();
      return;
  }
  var avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\imagenes\\" +
    idImage +
    formatBase64;
  try {
    fs.writeFileSync(avatarDirPath, imageBase64, "base64");

    res.writeHead(200, headerResponse);
    res.write("Image posted");
  } catch (error) {
    res.writeHead(500, headerResponse);
    res.write(error);
  } finally {
    res.end();
  }
};

exports.getImage = (req, res) => {
  var idImage = req.params.id;
  var avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\imagenes\\";
  fs.readdir(avatarDirPath, (err, files) => {
    if (err) console.log(err);
    else {
      files.map(archivo => {
        if (archivo.includes(idImage)) {
          fs.readFile(avatarDirPath + "\\" + archivo, {
            encoding: "base64"
          },(error, data) => {
            if (error) {
              res.writeHead(500, headerResponse);
              res.write(error);
              res.end();
              return;
            } else {
              const formatImage = data.charAt(0);
              console.log(formatImage);
              switch (formatImage) {
                case "/":
                  //data = "data:image/jpg;base64," + data;
                  res.writeHead(200, {'Access-Control-Allow-Origin': '*', 'Content-Type': 'image/jpeg'});
                  res.write(data);
                  res.end();
                  return;
                case "i":
                  //data = "data:image/png;base64," + data;
                  res.writeHead(200, {'Access-Control-Allow-Origin': '*', 'Content-Type': 'image/png'});
                  res.write(data);
                  res.end();
                  return;
                case "R":
                  //data = "data:image/gif;base64," + data;
                  res.writeHead(200, {'Access-Control-Allow-Origin': '*', 'Content-Type': 'image/gif'});
                  res.write(data);
                  res.end();
                  return;
                default:
                  res.writeHead(500, headerResponse);
                  res.write("imagen no compatible");
                  res.end();
                  return;
              }       
            }
          });
        }
      });
    }
  });
};

//Funcion para ver si el server esta en linea
exports.inicio = function(req, res) {
  console.log("Solicitud recibida");
  res.writeHead(200, headerResponse);
  res.write("Solicitud recibida");
  res.end();
};
