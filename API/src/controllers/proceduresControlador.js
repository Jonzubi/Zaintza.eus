const { writeImage, getRandomString } = require("../../util/funciones");
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

exports.getAnunciosConPerfil = (req, res, modelos) => {
  const modeloAnuncios = modelos.anuncio;

  modeloAnuncios
    .find()
    .populate('idCliente')
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

exports.postNewCuidador = async (req, res, modelos) => {
  const { email, contrasena, nombre, apellido1, apellido2,
          fechaNacimiento, sexo, descripcion, publicoDisponible, isPublic, precioPorPublico, diasDisponible,
          ubicaciones, telefono, imgContactB64, avatarPreview } = req.body;
  //Comprobamos que se han mandado los campos required del form cuidador
  if (typeof nombre == "undefined" || 
      typeof fechaNacimiento == "undefined" ||
      typeof sexo == "undefined" ||
      typeof descripcion == "undefined" || 
      typeof ubicaciones == "undefined" || 
      typeof telefono == "undefined" ||
      typeof imgContactB64 == "undefined" ||
      typeof email == "undefined" ||
      typeof contrasena == "undefined"){

        res.writeHead(500, headerResponse);
        res.write("Parametros incorrectos");
        res.end();
        return;
  }
  //Aqui los datos son validos y hay que insertarlos
  //Empezaremos con las fotos, comporbando que el campo opcional avatar se haya enviado o no
  //Pongo el codAvatar aqui ya que hay que insertarlo en la base de datos por si se ha definido
  let codAvatar;
  if(avatarPreview.length > 0){
    //Se ha elegido una imagen para el perfil
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
  }
  //Se manda la foto de contacto
  let codContactImg = getRandomString(20);
  writeImage(codContactImg, imgContactB64);

  const modeloCuidadores = modelos.cuidador;
  const modeloUsuario = modelos.usuario;

  const sesion = await modeloCuidadores.startSession();
  sesion.startTransaction();

  try {
    const opts = { sesion };
    const cuidadorInserted = await modeloCuidadores({
      nombre: nombre,
      apellido1: apellido1 || "",
      apellido2: apellido2 || "",
      sexo: sexo,
      direcFoto: codAvatar,
      direcFotoContacto: codContactImg,
      descripcion: descripcion || "",
      telefono: telefono,
      isPublic: isPublic,
      diasDisponible: diasDisponible,
      fechaNacimiento: fechaNacimiento,
      ubicaciones: ubicaciones,
      publicoDisponible: publicoDisponible,
      precioPorPublico: precioPorPublico
    })
    .save(opts);
    const usuarioInserted = await modeloUsuario({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cuidador",
      idPerfil: cuidadorInserted._id
    })
    .save(opts);

    await sesion.commitTransaction();
    sesion.endSession();

    res.writeHead(200, headerResponse);
    res.write(JSON.stringify({
      _id: cuidadorInserted._id,
      _idUsuario: usuarioInserted._id,
      direcFoto: codAvatar,
      direcFotoContacto: codContactImg
    }));
    res.end();
  } catch (error) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    await sesion.abortTransaction();
    sesion.endSession();
    console.log(err);
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(err));
    res.end();
  }
};

exports.postNewCliente = async (req, res, modelos) => {
  const { nombre, apellido1, apellido2, avatarPreview,  telefono, email, contrasena } = req.body;

  if(typeof nombre == "undefined" ||
     typeof telefono == "undefined" ||
     typeof email == "undefined" ||
     typeof contrasena == "undefined"){
      res.writeHead(500, headerResponse);
      res.write("Parametros incorrectos");
      res.end();
      return;
  }

  let codAvatar;
  if(avatarPreview.length > 0){
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
  }
  
  const modeloClientes = modelos.cliente;
  const modeluUsuarios = modelos.usuario;

  const sesion = await modeloClientes.startSession();
  sesion.startTransaction();

  try {
    const opts = { sesion };
    const insertedCliente = await modeloClientes({
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      telefono: telefono,
      direcFoto: codAvatar
    })
    .save(opts);
    const insertedUsuario = await modeluUsuarios({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cliente",
      idPerfil: insertedCliente._id
    })
    .save(opts);
    await sesion.commitTransaction();
    sesion.endSession();
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify({
      _id: insertedCliente._id,
      _idUsuario: insertedUsuario._id,
      direcFoto: codAvatar
    }));
    res.end();
  } catch (error) {
    await sesion.abortTransaction();
    sesion.endSession();
    console.log(err);
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(err));
    res.end();
  }
};

exports.patchCuidador = async (req, res, modelos) => {
  const { nombre, apellido1, apellido2,
    fechaNacimiento, sexo, descripcion, publicoDisponible, isPublic, precioPorPublico, diasDisponible,
    ubicaciones, telefono, imgContactB64, avatarPreview } = req.body;
  const { id } = req.params;

  if (typeof nombre == "" || typeof nombre == "undefined" ||
      typeof fechaNacimiento == "" || typeof fechaNacimiento == "undefined" ||
      typeof sexo == "" || typeof sexo == "undefined" ||
      typeof descripcion == "" || typeof descripcion == "undefined" ||
      typeof ubicaciones == "" || typeof ubicaciones == "undefined" ||
      typeof telefono == "" || typeof telefono == "undefined" ||
      typeof imgContactB64 == "undefined" || typeof id == "undefined"){

        res.writeHead(500, headerResponse);
        res.write("Parametros incorrectos");
        res.end();
        return;
  }

  let codAvatar;
  let formData = Object.assign({}, req.body);
  if(avatarPreview.length > 0){
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
    formData.direcFoto = codAvatar;
  }
  let codContactImg;
  if(imgContactB64.length > 0){
    codContactImg = getRandomString(20);
    writeImage(codContactImg, imgContactB64);
    formData.direcFotoContacto = codContactImg;
  }

  const modeloCuidadores = modelos.cuidador;
  modeloCuidadores
    .findByIdAndUpdate(id, formData)
    .then(doc => {
      if(codAvatar != null){
        doc.direcFoto = codAvatar
      }
      if(codContactImg != null){
        doc.direcFotoContacto = codContactImg;
      }
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

exports.patchCliente = async (req, res, modelos) => {
  const { nombre, avatarPreview,  telefono} = req.body;
  const { id } = req.params;

  if(typeof nombre == "undefined" ||
     typeof telefono == "undefined"){
      res.writeHead(500, headerResponse);
      res.write("Parametros incorrectos");
      res.end();
      return;
  }

  let codAvatar;
  let formData = Object.assign({}, req.body);
  if(avatarPreview.length > 0){
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
    formData.direcFoto = codAvatar;
  }

  const modeloClientes = modelos.cliente;
  modeloClientes
    .findByIdAndUpdate(id, formData)
    .then(doc => {
      if(codAvatar != null){
        doc.direcFoto = codAvatar
      }
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
}

exports.postAnuncio = async (req, res, modelos) => {
  const { titulo, descripcion, pueblo, publico, imgAnuncio, idCliente, horario } = req.body;

  if(typeof titulo === 'undefined' ||
     typeof descripcion === 'undefined' ||
     typeof publico === 'undefined' ||
     typeof pueblo === 'undefined' ||
     typeof idCliente === 'undefined' ||
     typeof horario === 'undefined'){
      res.writeHead(500, headerResponse);
      res.write("Parametros incorrectos");
      res.end();
      return;
     }

  let codImagen;
  let formData = Object.assign({}, req.body);
  if(typeof imgAnuncio != 'undefined'){
    codImagen = getRandomString(20);
    writeImage(codImagen, imgAnuncio);
    formData.direcFoto = codImagen;
  } else {
    codImagen = 'noImage';    
  }
  formData.direcFoto = codImagen;
  
  const modeloAnuncio = modelos.anuncio;
  modeloAnuncio(formData)
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
    .finally(fin => {
      res.end();
    });  
}

exports.postPropuestaAcuerdo = async (req, res, modelos) => {

};
