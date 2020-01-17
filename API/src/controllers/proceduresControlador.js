const headerResponse = require("../../util/headerResponse");

exports.getAcuerdosConUsuarios = (req, res, modelos) => {
  const { tipoUsuario, idPerfil, estadoAcuerdo } = req.query;
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
  } else if(tipoUsuario == "Cuidador"){
    columna = "idCuidador";
    columnaLaOtraPersona = "idCliente";
  }
  else{
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let filtrosConsulta = { [columna]: idPerfil };
  //El parametro estadoAcuerdo es opcional para el procedure, si se le pasa lo va a aplicar
  if(typeof estadoAcuerdo != "undefined"){
    filtrosConsulta.estadoAcuerdo = estadoAcuerdo;
  }

  modeloAcuerdos
    .find( filtrosConsulta )    
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

exports.getUsuarioConPerfil = (req, res, modelos) => {
  const { email, contrasena } = req.query;

  if(typeof email == "undefined" || typeof contrasena == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const filtros = {
    email: email,
    contrasena: contrasena
  }

  modeloUsuario
    .find(filtros)
    .populate('idPerfil')
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
