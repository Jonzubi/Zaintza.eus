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
  if (tipoUsuario == "C") {
    columna = "idCliente";
    columnaLaOtraPersona = "idCuidador";
  } else {
    columna = "idCuidador";
    columnaLaOtraPersona = "idCliente";
  }
  console.log(columna);
  console.log(idPerfil);
  const filtro = {
    [columna]: idPerfil
  }
  console.log(filtro);
  modeloAcuerdos
    .find(filtro)
    
    .populate(columnaLaOtraPersona)
    .then(respuesta => {
      console.log(respuesta);
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
