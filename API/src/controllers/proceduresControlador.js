const headerResponse = require("../../util/headerResponse");

exports.getAcuerdosConUsuarios = (req, res) => {
  const tipoUsuario = req.query.tipoUsuario;
  const idPerfil = req.query.idPerfil;
  if (typeof tipoUsuario == "undefined" || typeof idPerfil == "undefined") {
    console.log(tipoUsuario);
    console.log(idPerfil);
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }
  const modeloAcuerdos = require("../models/acuerdo");
  let columna, columnaLaOtraPersona;
  if (tipoUsuario == "C") {
    columna = "idCliente";
    columnaLaOtraPersona = "idCuidador";
  } else {
    columna = "idCuidador";
    columnaLaOtraPersona = "idCliente";
  }
  console.log(columna);
  modeloAcuerdos
    .find({ [columna]: idPerfil })
    .populate(columnaLaOtraPersona)
    .then(respuesta => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(respuesta));
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
      res.end();
    });
};
