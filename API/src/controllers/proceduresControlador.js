const {
  writeImage,
  getRandomString,
  getTodayDate,
  caesarShift,
  readHTMLFile
} = require("../../util/funciones");
const headerResponse = require("../../util/headerResponse");
const ipMaquina = require("../../util/ipMaquina");
const handlebars = require("handlebars");

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
  } else if (tipoUsuario == "Cuidador") {
    columna = "idCuidador";
    columnaLaOtraPersona = "idCliente";
  } else {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let filtrosConsulta = { [columna]: idPerfil };
  //El parametro estadoAcuerdo es opcional para el procedure, si se le pasa lo va a aplicar
  if (typeof estadoAcuerdo != "undefined") {
    filtrosConsulta.estadoAcuerdo = estadoAcuerdo;
  }

  modeloAcuerdos
    .find(filtrosConsulta)
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
  if (typeof idUsuario == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloNotificacion = modelos.notificacion;

  modeloNotificacion
    .find({ idUsuario: idUsuario, show: true })
    .populate({
      path: "idRemitente",
      populate: { path: "idPerfil" }
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

exports.getUsuarioConPerfil = async (req, res, modelos) => {
  const { email, contrasena } = req.query;

  if (typeof email == "undefined" || typeof contrasena == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const modeloAjuste = modelos.ajuste;
  const filtros = {
    email: email,
    contrasena: contrasena
  };

  const usu = await modeloUsuario.findOne(filtros);
  if (usu !== null) {
    const ajus = await modeloAjuste.findOne({ idUsuario: usu._id });
    if (ajus !== null) {
      modeloAjuste
        .findOne({ idUsuario: usu._id })
        .populate({
          path: "idUsuario",
          populate: "idPerfil"
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
    } else {
      modeloUsuario.findOne(filtros)
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
    }
  } else {
    res.writeHead(200, headerResponse);
    res.write("Vacio");
    res.end();
  }
};

exports.getAnunciosConPerfil = (req, res, modelos) => {
  const modeloAnuncios = modelos.anuncio;
  let strColumnas, objFiltros, objOptions;
  if (typeof req.query.filtros != "undefined") {
    objFiltros = JSON.parse(req.query.filtros);
  }
  if (typeof req.query.options !== 'undefined') {
    objOptions = JSON.parse(req.query.options);
  }
  modeloAnuncios
    .find(objFiltros, strColumnas, objOptions)
    .populate("idCliente")
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
  const {
    email,
    contrasena,
    nombre,
    apellido1,
    apellido2,
    fechaNacimiento,
    sexo,
    descripcion,
    publicoDisponible,
    isPublic,
    precioPorPublico,
    diasDisponible,
    ubicaciones,
    telefono,
    imgContactB64,
    avatarPreview,
    validationToken
  } = req.body;
  //Comprobamos que se han mandado los campos required del form cuidador
  if (
    typeof nombre == "undefined" ||
    typeof fechaNacimiento == "undefined" ||
    typeof sexo == "undefined" ||
    typeof descripcion == "undefined" ||
    typeof ubicaciones == "undefined" ||
    typeof telefono == "undefined" ||
    typeof imgContactB64 == "undefined" ||
    typeof email == "undefined" ||
    typeof contrasena == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }
  //Aqui los datos son validos y hay que insertarlos
  //Empezaremos con las fotos, comporbando que el campo opcional avatar se haya enviado o no
  //Pongo el codAvatar aqui ya que hay que insertarlo en la base de datos por si se ha definido
  let codAvatar;
  if (avatarPreview.length > 0) {
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
    }).save(opts);
    const usuarioInserted = await modeloUsuario({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cuidador",
      idPerfil: cuidadorInserted._id,
      validado: false,
      validationToken: caesarShift(validationToken, 10)
    }).save(opts);

    await sesion.commitTransaction();
    sesion.endSession();

    res.writeHead(200, headerResponse);
    res.write(
      JSON.stringify({
        _id: cuidadorInserted._id,
        _idUsuario: usuarioInserted._id,
        direcFoto: codAvatar,
        direcFotoContacto: codContactImg
      })
    );
    res.end();
  } catch (error) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    await sesion.abortTransaction();
    sesion.endSession();
    console.log(error);
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(error));
    res.end();
  }
};

exports.postNewCliente = async (req, res, modelos) => {
  const {
    nombre,
    apellido1,
    apellido2,
    avatarPreview,
    telefono,
    email,
    contrasena,
    validationToken
  } = req.body;

  if (
    typeof nombre == "undefined" ||
    typeof telefono == "undefined" ||
    typeof email == "undefined" ||
    typeof contrasena == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let codAvatar;
  if (avatarPreview.length > 0) {
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
    }).save(opts);
    const insertedUsuario = await modeluUsuarios({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cliente",
      idPerfil: insertedCliente._id,
      validado: false,
      validationToken: caesarShift(validationToken, 10)
    }).save(opts);
    await sesion.commitTransaction();
    sesion.endSession();
    res.writeHead(200, headerResponse);
    res.write(
      JSON.stringify({
        _id: insertedCliente._id,
        _idUsuario: insertedUsuario._id,
        direcFoto: codAvatar
      })
    );
    res.end();
  } catch (error) {
    await sesion.abortTransaction();
    sesion.endSession();
    console.log(error);
    res.writeHead(500, headerResponse);
    res.write(JSON.stringify(error));
    res.end();
  }
};

exports.patchCuidador = async (req, res, modelos) => {
  const {
    nombre,
    apellido1,
    apellido2,
    fechaNacimiento,
    sexo,
    descripcion,
    publicoDisponible,
    isPublic,
    precioPorPublico,
    diasDisponible,
    ubicaciones,
    telefono,
    imgContactB64,
    avatarPreview
  } = req.body;
  const { id } = req.params;

  if (
    typeof nombre == "" ||
    typeof nombre == "undefined" ||
    typeof fechaNacimiento == "" ||
    typeof fechaNacimiento == "undefined" ||
    typeof sexo == "" ||
    typeof sexo == "undefined" ||
    typeof descripcion == "" ||
    typeof descripcion == "undefined" ||
    typeof ubicaciones == "" ||
    typeof ubicaciones == "undefined" ||
    typeof telefono == "" ||
    typeof telefono == "undefined" ||
    typeof imgContactB64 == "undefined" ||
    typeof id == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let codAvatar;
  let formData = Object.assign({}, req.body);
  if (avatarPreview.length > 0) {
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
    formData.direcFoto = codAvatar;
  }
  let codContactImg;
  if (imgContactB64.length > 0) {
    codContactImg = getRandomString(20);
    writeImage(codContactImg, imgContactB64);
    formData.direcFotoContacto = codContactImg;
  }

  const modeloCuidadores = modelos.cuidador;
  modeloCuidadores
    .findByIdAndUpdate(id, formData)
    .then(doc => {
      if (codAvatar != null) {
        doc.direcFoto = codAvatar;
      }
      if (codContactImg != null) {
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
  const { nombre, avatarPreview, telefono } = req.body;
  const { id } = req.params;

  if (typeof nombre == "undefined" || typeof telefono == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let codAvatar;
  let formData = Object.assign({}, req.body);
  if (avatarPreview.length > 0) {
    codAvatar = getRandomString(20);
    writeImage(codAvatar, avatarPreview);
    formData.direcFoto = codAvatar;
  }

  const modeloClientes = modelos.cliente;
  modeloClientes
    .findByIdAndUpdate(id, formData)
    .then(doc => {
      if (codAvatar != null) {
        doc.direcFoto = codAvatar;
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

exports.postAnuncio = async (req, res, modelos) => {
  const {
    titulo,
    descripcion,
    pueblo,
    publico,
    imgAnuncio,
    idCliente,
    horario
  } = req.body;

  if (
    typeof titulo === "undefined" ||
    typeof descripcion === "undefined" ||
    typeof publico === "undefined" ||
    typeof pueblo === "undefined" ||
    typeof idCliente === "undefined" ||
    typeof horario === "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  let codImagen;
  let formData = Object.assign({}, req.body);
  if (typeof imgAnuncio != "undefined") {
    codImagen = getRandomString(20);
    writeImage(codImagen, imgAnuncio);
    formData.direcFoto = codImagen;
  } else {
    codImagen = "noImage";
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
};

exports.postPropuestaAcuerdo = async (req, res, modelos) => {
  //Nota -> idUsuario es el id del usuario que ha mandado la peticion lo usare en idRemitente de notificacion
  const {
    idCuidador,
    idCliente,
    idUsuario,
    diasAcordados,
    tituloAcuerdo,
    pueblo,
    descripcionAcuerdo,
    origenAcuerdo
  } = req.body;
  // TODO estadoAcuerdo y dateAcuerdo se calcularan en el servidor

  if (
    typeof idCuidador === "undefined" ||
    typeof idCliente === "undefined" ||
    typeof idUsuario === "undefined" ||
    typeof diasAcordados === "undefined" ||
    typeof tituloAcuerdo === "undefined" ||
    typeof pueblo === "undefined" ||
    typeof descripcionAcuerdo === "undefined" ||
    typeof origenAcuerdo === "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }
  //Estado acuerdo indica de que el acuerdo creado estará en pendiente
  const estadoAcuerdo = 0;
  const dateAcuerdo = getTodayDate();
  const objDate = new Date();

  const modeloAcuerdos = modelos.acuerdo;
  const sesion = await modeloAcuerdos.startSession();
  const modeloUsuarios = modelos.usuario;
  const modeloNotificaciones = modelos.notificacion;
  //Esto lo hago para saber quien est a enviando la propuesta
  //Si lo manda un cliente se va a buscar el usuario que tenga ese idCuidador en idPerfil
  //Es para despues mandar la notificacion del acuerdo a la otra parte
  const idUsuarioABuscar = origenAcuerdo === "Cliente" ? idCuidador : idCliente;

  let formData = {
    idCuidador,
    idCliente,
    diasAcordados,
    tituloAcuerdo,
    pueblo,
    estadoAcuerdo,
    dateAcuerdo,
    descripcionAcuerdo,
    origenAcuerdo
  };
  sesion.startTransaction();
  try {
    const opts = { sesion };
    const acuerdoGuardado = await modeloAcuerdos(formData)
      .save(opts)
      .catch(err => {
        console.log(err);
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    const usuarioBuscado = await modeloUsuarios
      .findOne({ idPerfil: idUsuarioABuscar })
      .catch(err => {
        console.log(err);
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    formData = {
      idUsuario: usuarioBuscado._id,
      idRemitente: idUsuario,
      tipoNotificacion: "Acuerdo",
      acuerdo: acuerdoGuardado,
      visto: false,
      dateEnvioNotificacion: `${dateAcuerdo} ${objDate.getHours()}:${objDate.getMinutes()}`
    };
    await modeloNotificaciones(formData).save(opts);

    await sesion.commitTransaction();
    sesion.endSession();
    res.writeHead(200, headerResponse);
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

exports.patchPredLang = async (req, res, modelos) => {
  const { id } = req.params;
  const modeloAjustes = modelos.ajuste;

  const ajusteExistente = await modeloAjustes.find({ idUsuario: id });
  if (ajusteExistente.length === 0) {
    const ajuste = await modeloAjustes({
      idUsuario: id,
      idLangPred: req.body.idLangPred
    })
      .save()
      .catch(err => {
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(ajuste));
    res.end();
  } else {
    const ajuste = await modeloAjustes
      .findOneAndUpdate({ idUsuario: id }, { idLangPred: req.body.idLangPred })
      .catch(err => {
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(ajuste));
    res.end();
  }
};

exports.confirmarEmail = async (req, res, modelos) => {
  const modeloUsuarios = modelos.usuario;
  const { validationToken } = req.query;

  const usuarioBuscado = await modeloUsuarios.findOneAndUpdate({ validationToken }, { validado: true});
  if(usuarioBuscado) {
    res.writeHead(200, {"Content-Type": "text/html"});
    readHTMLFile("emailConfirmado", (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template({
        ipMaquina
      });
      res.write(htmlToSend);
      res.end();
    });
    
  } else {
    res.writeHead(204, headerResponse);
    res.write("No email");
    res.end();
  }
}

exports.getEmailWithIdPerfil = async (req, res, modelos) => {
  const { idPerfil } = req.params;
  const modeloUsuario = modelos.usuario;

  const usuarioFound = await modeloUsuario.findOne({ idPerfil }, "email");
  res.writeHead(200, {"Content-Type": "text/plain"});
  const response = usuarioFound !== null ? usuarioFound.email : "Vacio";
  res.write(response);
  res.end();
}

exports.getNotificationsWithIdUsuario = async (req, res, modelos) => {
  const { idUsuario } = req.params;
  const { email, contrasena } = req.body;
  const modeloUsuario = modelos.usuario;
  const modeloNotificacion = modelos.notificacion;
  const validUser = await modeloUsuario.findById(idUsuario);
  if (validUser.email === email && validUser.contrasena === contrasena) {
    const notificaciones = await modeloNotificacion.find({ idUsuario, visto: false});
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(notificaciones));
    res.end();
  } else {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
  }
}

exports.getIdUsuarioConIdPerfil = async (req, res, modelos) => {
  const { idPerfil } = req.params;

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil });
  let id = usuario._id.toString();
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write(id);
  res.end();
}
