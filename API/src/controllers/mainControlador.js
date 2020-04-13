const headerResponse = require("../../util/headerResponse");
const fs = require("fs");
const { writeImage } = require("../../util/funciones");

const modelosPermitidos = ["cuidador", "anuncio"];

const isValidRequest = async (req, res, modelos) => {
  const tabla = req.params.tabla;
  if (!modelosPermitidos.includes(tabla)) {
    // La idea de esta condicion es que si se hace una peticion a una tabla que no es licita, 
    //si se quiere modificar cierto registro se deje mediante la verificacion del usuario al que pertenece el registro
    if (req.params.id !== undefined) {
      const { email, contrasena } = req.body;
      const id = req.params.id;
      const modelo = modelos[tabla];
      const modeloBuscado = await modelo.findById(id)
                              .populate("idUsuario");
      if (modeloBuscado.idUsuario.email === email && modeloBuscado.idUsuario.contrasena === contrasena){
        return true;
      }
      //Si la contraseña o el email no coinciden entrara en el codigo de abajo como una peticion ilicita
    }
    const invalidRequestModel = modelos.invalidRequest;    
    const ipAddress = req.connection.remoteAddress;
    const requestMethod = req.method;
    const formData = {
      errorCode: 405,
      ipAddress,
      requestMethod,
      errorMsg: `Intento de intrusion a ${req.originalUrl}`,
      requestParams: req.params,
      requestQuery: req.query,
      requestBody: req.body
    }
    console.log(formData);
    const invalidRequestConfigurado = new invalidRequestModel(formData);
    //invalidRequestConfigurado.save();
    res.writeHead(405, headerResponse);
    res.write(`La IP: ${ipAddress} ha sido registrada por una operacion no lÃ­cita`);
    res.end();

    return false;
  }

  return true;
}

exports.get = async (req, res, modelos) => {
  let tabla = req.params.tabla;
  let id = req.params.id;
  //La idea es en query mandar un string columnas = "nombre apellido1 apellido2" asi se lo incrusto directo a la query
  let strColumnas = req.query.columnas;
  let objFilter;
  let objOptions;
  if (typeof req.query.filtros != "undefined") {
    objFilter = JSON.parse(req.query.filtros);
  }
  if (typeof req.query.options !== 'undefined') {
    objOptions = JSON.parse(req.query.options);
  }
  //Trozo de codigo que comprueba que lo que se hace es licito
  const isValid = await isValidRequest(req, res, modelos);
  if(!isValid) {
    return;
  }

  let modelo = modelos[tabla];
  if (typeof id == "undefined") {
    modelo
      .find(objFilter, strColumnas, objOptions)
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
      .findById(id, strColumnas, objOptions)
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

exports.insert = async (req, res, modelos) => {
  let tabla = req.params.tabla;
  let modelo = modelos[tabla];

  if (typeof modelo == "undefined") {
    res.writeHead(500, headerResponse);
    res.send("MODELO IS UNDEFINED");
    res.end();
    return;
  }

  //Trozo de codigo que comprueba que lo que se hace es licito
  const isValid = await isValidRequest(req, res, modelos);
  if(!isValid) {
    return;
  }

  let modeloConfiged = new modelo(req.body);

  modeloConfiged
    .save()
    .then(doc => {
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

exports.update = async (req, res, modelos) => {
  //Trozo de codigo que comprueba que lo que se hace es licito
  const isValid = await isValidRequest(req, res, modelos);
  if(!isValid) {
    return;
  }

  let tabla = req.params.tabla;
  let id = req.params.id;
  let modelo = modelos[tabla];
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

exports.delete = async (req, res, modelos) => {
  //Trozo de codigo que comprueba que lo que se hace es licito
  const isValid = await isValidRequest(req, res, modelos);
  if(!isValid) {
    return;
  }
  let tabla = req.params.tabla;
  let id = req.params.id;
  let modelo = modelos[tabla];
  modelo
    .deleteOne({ _id: id })
    .then(deleted => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(deleted));
      res.end();
    })
    .catch(error => {
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(error));
      res.end();
    });
};

exports.postImage = (req, res) => {
  let idImage = req.params.id;
  let imageBase64 = req.body.imageB64;

  try {
    writeImage(id, imageBase64);

    res.writeHead(200, headerResponse);
    res.write("Image posted");
  } catch (error) {
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(error));
  } finally {
    res.end();
  }
};

exports.getImage = (req, res) => {
  let idImage = req.params.id;
  let avatarDirPath = __dirname.substring(0, __dirname.lastIndexOf("\\"));
  avatarDirPath =
    avatarDirPath.substring(0, avatarDirPath.lastIndexOf("\\")) +
    "\\util\\imagenes\\";
  //avatarDirPath = "/var/www/ProyectoAplicacionWeb/API/util/imagenes/";
  fs.readdir(avatarDirPath, (err, files) => {
    if (err) {
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    } else {
      let found = false;
      files.map(archivo => {
        if (archivo.includes(idImage)) {
          found = true;
          let stream = fs.createReadStream(avatarDirPath + archivo);
          let formato = archivo.split(".")[1];
          switch (formato) {
            case "png":
              res.setHeader("Content-Type", "image/png");
              break;
            case "jpg":
              res.setHeader("Content-Type", "image/jpeg");
              break;
            case "gif":
              res.setHeader("Content-Type", "image/gif");
              break;
          }
          stream.pipe(res);
        }
      });
      if (!found) {
        res.write("Vacio");
        res.end();
      }
    }
  });
};

//Funcion para ver si el server esta en linea
exports.inicio = function(req, res) {
  res.writeHead(200, headerResponse);
  res.write("Solicitud recibida");
  res.end();
};
