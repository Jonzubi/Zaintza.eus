const headerResponse = require("../../util/headerResponse");
const fs = require("fs");

exports.get = function(req, res, conexion) {
  let tabla = req.params.tabla;
  let id = req.params.id;
  //La idea es en query mandar un string columnas = "nombre apellido1 apellido2" asi se lo incrusto directo a la query
  let strColumnas = req.query.columnas;
  let objFilter;
  let objJoin = null;
  if (typeof req.query.filtros != "undefined") {
    objFilter = JSON.parse(req.query.filtros);
  }
  if (typeof req.query.join != "undefined"){
    objJoin = JSON.parse(req.query.join);
  }
  let modelo = require("../models/" + tabla)(conexion);
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
        res.write(JSON.stringify(err));
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
        res.write(JSON.stringify(err));
      })
      .finally(fin => {
        res.end();
      });
  }
};

exports.insert = function(req, res, conexion) {
  console.log(req.body);
  let tabla = req.params.tabla;
  let modelo = require("../models/" + tabla)(conexion);

  if (typeof modelo == "undefined"){
    res.writeHead(500, headerResponse);
    res.send("MODELO IS UNDEFINED");
    res.end();
    return;
  } 

  let modeloConfiged = new modelo(req.body);

  modeloConfiged
    .save()
    .then(doc => {
      console.log(doc);
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch(err => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(err => {
      res.end();
    });
};

exports.update = function(req, res, conexion) {
  let tabla = req.params.tabla;
  let id = req.params.id;
  let modelo = require("../models/" + tabla)(conexion);
  console.log(req.body);
  modelo
    .findByIdAndUpdate(id, req.body)
    .then(doc => {      
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch(err => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(fin => {
      res.end();
    });
};

exports.delete = function(req, res, conexion) {
  let tabla = req.params.tabla;
  let id = req.params.id;
  let modelo = require("../models/" + tabla)(conexion);

  res.writeHead(200, headerResponse);
  modelo
    .deleteOne({ _id: id })
    .then(doc => {
      res.write(JSON.stringify(doc));
    })
    .catch(err => {
      res.write(JSON.stringify(err));
    })
    .finally(fin => {
      res.end();
    });
};

exports.postImage = (req, res, conexion) => {
  let idImage = req.params.id;
  let imageBase64 = req.body.imageB64.split(",")[1];
  let formatBase64 = imageBase64.charAt(0);

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
  let avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\imagenes\\" +
    idImage +
    formatBase64;
  //avatarDirPath = "/var/www/ProyectoAplicacionWeb/API/util/imagenes/" + idImage + formatBase64;
  try {
    fs.writeFileSync(avatarDirPath, imageBase64, "base64");

    res.writeHead(200, headerResponse);
    res.write("Image posted");
  } catch (error) {
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(error));
  } finally {
    res.end();
  }
};

exports.getImage = (req, res, conexion) => {
  let idImage = req.params.id;
  let avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\imagenes\\";
  //avatarDirPath = "/var/www/ProyectoAplicacionWeb/API/util/imagenes/";
  fs.readdir(avatarDirPath, (err, files) => {
    if (err) console.log(err);
    else {
      let found = false;
      files.map(archivo => {
        if (archivo.includes(idImage)) {
          found = true;
          let stream = fs.createReadStream(avatarDirPath + archivo);
          let formato = archivo.split('.')[1];
          switch(formato){
            case "png":
              res.setHeader('Content-Type', 'image/png');
              break;
            case "jpg":
                res.setHeader('Content-Type', 'image/jpeg');
                break;
            case "gif":
                res.setHeader('Content-Type', 'image/gif');
                break;
          }
          stream.pipe(res);
        }
      });
      if(!found){
        res.write("Vacio");
        res.end();
      }
    }
  });
};

//Funcion para ver si el server esta en linea
exports.inicio = function(req, res, conexion) {
  console.log("Solicitud recibida");
  res.writeHead(200, headerResponse);
  res.write("Solicitud recibida");
  res.end();
};
