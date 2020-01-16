const headerResponse = require("../../util/headerResponse");

exports.getAcuerdosConUsuarios = (req, res, modelos) => {
  const tipoUsuario = req.query.tipoUsuario;
  const idPerfil = req.query.idPerfil;
  if (typeof tipoUsuario == "undefined" || typeof idPerfil == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloAcuerdos = modelos.acuerdo;

  let columna, columnaLaOtraPersona;
  if (tipoUsuario == "Cliente") {
    columna = "idCliente";
    columnaLaOtraPersona = "idCuidador";
  } else {
    columna = "idCuidador";
    columnaLaOtraPersona = "idCliente";
  }

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

exports.getNotificacionesConUsuarios = (req, res, modelos) => {
  const idUsuario = req.query.idUsuario;
  if(typeof idUsuario == "undefined"){
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloNotificacion = modelos.notificacion;

  modeloNotificacion
    .find( {idUsuario: idUsuario} )
    .populate({
      path: 'idRemitente',
      populate: { path: 'idPerfil' }
    })
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
