const {
  writeImage,
  getRandomString,
  getTodayDate,
  caesarShift,
  readHTMLFile,
  shuffleArray
} = require("../../util/funciones");
const headerResponse = require("../../util/headerResponse");
const ipMaquina = require("../../util/ipMaquina");
const handlebars = require("handlebars");
const moment = require("moment-timezone");
const { coordsMunicipios } = require('../../util/municipiosCoords');

const getKmFromCoords = function (lat1, lon1, lat2, lon2) {
  rad = function (x) {
    return (x * Math.PI) / 180;
  };
  var R = 6378.137; //Radio de la tierra en km
  var dLat = rad(lat2 - lat1);
  var dLong = rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d.toFixed(3); //Retorna tres decimales
};

exports.getAcuerdosConUsuarios = async (req, res, modelos) => {
  const { email, contrasena, tipoUsuario, idPerfil, estadoAcuerdo } = req.body;
  if (typeof tipoUsuario == "undefined" || typeof idPerfil == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
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
  //El parametro estadoAcuerdo es opcional para el procedure, si se le pasa lo va a aplicar en los FILTROS
  if (typeof estadoAcuerdo != "undefined") {
    filtrosConsulta.estadoAcuerdo = estadoAcuerdo;
  }

  let acuerdos = await modeloAcuerdos
    .find(filtrosConsulta)
    .populate(columnaLaOtraPersona)
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
      res.end();
      return;
    });
  /**
   * Filtro los acuerdos para que en caso de que un usuario tenga que aceptar un acuerdo no le aparezca en acuerdosFrom
   * Ya que en acuerdosForm si aparece en pendiente pone que lo tiene que aceptar el otro
   */
  acuerdos = acuerdos.filter((acuerdo) => {
    const { estadoAcuerdo, origenAcuerdo } = acuerdo;
    if (estadoAcuerdo === 0) {
      if (origenAcuerdo !== tipoUsuario) {
        return false;
      }
    }
    return true;
  })
  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(acuerdos));
  res.end();
};

exports.getNotificacionesConUsuarios = async (req, res, modelos) => {
  const { email, contrasena, idUsuario } = req.body;
  if (typeof idUsuario == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(idUsuario);

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  const modeloNotificacion = modelos.notificacion;

  modeloNotificacion
    .find({ idUsuario: idUsuario, show: true })
    .populate({
      path: "idRemitente",
      select: "-contrasena -email -validado -validationToken",
      populate: { path: "idPerfil" },
    })
    .then((respuesta) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(respuesta));
      res.end();
    })
    .catch((err) => {
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
    contrasena: contrasena,
  };

  const usu = await modeloUsuario.findOne(filtros);
  if (usu !== null) {
    const ajus = await modeloAjuste.findOne({ idUsuario: usu._id });
    if (ajus !== null) {
      modeloAjuste
        .findOne({ idUsuario: usu._id })
        .populate({
          path: "idUsuario",
          populate: "idPerfil",
        })
        .then((respuesta) => {
          res.writeHead(200, headerResponse);
          res.write(JSON.stringify(respuesta));
          res.end();
        })
        .catch((err) => {
          console.log(err);
          res.writeHead(500, headerResponse);
          res.write(JSON.stringify(err));
          res.end();
        });
    } else {
      modeloUsuario
        .findOne(filtros)
        .populate("idPerfil")
        .then((respuesta) => {
          res.writeHead(200, headerResponse);
          res.write(JSON.stringify(respuesta));
          res.end();
        })
        .catch((err) => {
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

exports.getAnunciosConPerfil = async (req, res, modelos) => {
  const modeloAnuncios = modelos.anuncio;
  const { filtros, options, maxDistance, coords } = req.query;
  let strColumnas, objFiltros, objOptions;
  if (typeof filtros != "undefined") {
    objFiltros = JSON.parse(req.query.filtros);
  }
  if (typeof options !== "undefined") {
    objOptions = JSON.parse(req.query.options);
  }
  const anuncios = await modeloAnuncios
    .find(objFiltros, strColumnas, objOptions)
    .populate("idCliente");
  
  const ifMaxDistance = maxDistance || 30;
  const resultadoConCoords = [];
  let resultadoSinCoords = [];

  if (coords) {
    const objCoords = JSON.parse(coords);

    anuncios.filter(eachItem => {
      let shouldBeSend = false;
      let minDistancia = 100000000;
      eachItem.pueblo.forEach(ubicacion => {
        const ubicacionCoords = coordsMunicipios.find(coord => coord.nombreCiudad === ubicacion);
        if (ubicacionCoords){
          const { latitud, longitud } = ubicacionCoords;
          const clienteLatitud = objCoords.latitud;
          const clienteLongitud = objCoords.longitud;
          const distancia = parseInt(getKmFromCoords(clienteLatitud, clienteLongitud, latitud, longitud));
          
          if (!shouldBeSend) {
            shouldBeSend = distancia < ifMaxDistance;
          }          

          if (minDistancia > distancia) {
            minDistancia = distancia;
          }
        } else {
          shouldBeSend = false;
        }
      });
      if (shouldBeSend) {
        resultadoConCoords.push(Object.assign({ anuncio: eachItem, distancia: minDistancia }));
      }
    }); 
  } else {
    resultadoSinCoords = anuncios.map(anuncio => ({
      anuncio,
      distancia: false
    }));
  }

  resultadoConCoords.sort((a, b) => a.distancia > b.distancia ? 1 : -1);
  
  // Si se han calculado las distancias, enviará el array ordenado por distancia, si no va a devolver los cuidadores con un orden random
  const enviarResultado = resultadoConCoords.length > 0 ? resultadoConCoords : shuffleArray(resultadoSinCoords);

  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(enviarResultado));
  res.end();
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
    telefonoMovil,
    telefonoFijo,
    imgContactB64,
    avatarPreview,
    validationToken,
  } = req.body;
  //Comprobamos que se han mandado los campos required del form cuidador
  if (
    typeof nombre == "undefined" ||
    typeof fechaNacimiento == "undefined" ||
    typeof sexo == "undefined" ||
    typeof descripcion == "undefined" ||
    typeof ubicaciones == "undefined" ||
    typeof telefonoMovil === "" ||
    typeof imgContactB64 == "undefined" ||
    typeof email == "undefined" ||
    typeof contrasena == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  // Comprobamos que el email no existe
  const modeloUsuario = modelos.usuario;
  const emailEncontrado = await modeloUsuario.findOne({ email });

  if (emailEncontrado !== null) {
    res.writeHead(405, headerResponse);
    res.write("Email existente");
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
      telefonoMovil,
      telefonoFijo,
      isPublic: isPublic,
      diasDisponible: diasDisponible,
      fechaNacimiento: fechaNacimiento,
      ubicaciones: ubicaciones,
      publicoDisponible: publicoDisponible,
      precioPorPublico: precioPorPublico,
    }).save(opts);
    const usuarioInserted = await modeloUsuario({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cuidador",
      idPerfil: cuidadorInserted._id,
      validado: false,
      validationToken: caesarShift(validationToken, 10),
    }).save(opts);

    await sesion.commitTransaction();
    sesion.endSession();

    res.writeHead(200, headerResponse);
    res.write(
      JSON.stringify({
        _id: cuidadorInserted._id,
        _idUsuario: usuarioInserted._id,
        direcFoto: codAvatar,
        direcFotoContacto: codContactImg,
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
    telefonoMovil,
    telefonoFijo,
    email,
    contrasena,
    validationToken,
  } = req.body;

  if (
    typeof nombre == "undefined" ||
    typeof telefonoMovil === "" ||
    typeof email == "undefined" ||
    typeof contrasena == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  // Comprobamos que el email no existe
  const modeloUsuario = modelos.usuario;
  const emailEncontrado = await modeloUsuario.findOne({ email });

  if (emailEncontrado !== null) {
    res.writeHead(405, headerResponse);
    res.write("Email existente");
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
      telefonoMovil,
      telefonoFijo,
      direcFoto: codAvatar,
    }).save(opts);
    const insertedUsuario = await modeluUsuarios({
      email: email,
      contrasena: contrasena,
      tipoUsuario: "Cliente",
      idPerfil: insertedCliente._id,
      validado: false,
      validationToken: caesarShift(validationToken, 10),
    }).save(opts);
    await sesion.commitTransaction();
    sesion.endSession();
    res.writeHead(200, headerResponse);
    res.write(
      JSON.stringify({
        _id: insertedCliente._id,
        _idUsuario: insertedUsuario._id,
        direcFoto: codAvatar,
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
    email,
    contrasena,
    idUsuario,
    fechaNacimiento,
    sexo,
    descripcion,
    ubicaciones,
    telefonoMovil,
    imgContactB64,
    avatarPreview,
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
    typeof telefonoMovil === "" ||
    typeof imgContactB64 == "undefined" ||
    typeof id == "undefined"
  ) {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuarios = modelos.usuario;
  const usuario = await modeloUsuarios.findById(idUsuario);
  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
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
    .then((doc) => {
      if (codAvatar != null) {
        doc.direcFoto = codAvatar;
      }
      if (codContactImg != null) {
        doc.direcFotoContacto = codContactImg;
      }
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.patchCliente = async (req, res, modelos) => {
  const {
    nombre,
    avatarPreview,
    telefonoMovil,
    telefonoFijo,
    email,
    contrasena,
    idUsuario,
  } = req.body;
  const { id } = req.params;

  if (typeof nombre == "undefined" || typeof telefonoMovil === "") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuarios = modelos.usuario;
  const usuario = await modeloUsuarios.findById(idUsuario);
  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
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
    .then((doc) => {
      if (codAvatar != null) {
        doc.direcFoto = codAvatar;
      }
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
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
    horario,
    email,
    contrasena,
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

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil: idCliente });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
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
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
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
    origenAcuerdo,
    email,
    contrasena,
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
  // Comprobamos que el que manda la peticion es un usuario autentico
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(idUsuario);
  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  // Comprobamos que no existe un acuerdo ya
  const modeloAcuerdos = modelos.acuerdo;
  const acuerdo = await modeloAcuerdos.findOne({
    idCuidador,
    idCliente,
    $or: [{ estadoAcuerdo: 1 }, { estadoAcuerdo: 0 }],
  });

  if (acuerdo !== null) {
    res.writeHead(405, headerResponse);
    res.write("Ya existe un acuerdo");
    res.end();
    return;
  }

  //Estado acuerdo indica de que el acuerdo creado estará en pendiente
  const estadoAcuerdo = 0;
  const dateAcuerdo = getTodayDate();
  const objDate = new Date();

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
    origenAcuerdo,
  };
  sesion.startTransaction();
  try {
    const opts = { sesion };
    const acuerdoGuardado = await modeloAcuerdos(formData)
      .save(opts)
      .catch((err) => {
        console.log(err);
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    const usuarioBuscado = await modeloUsuarios
      .findOne({ idPerfil: idUsuarioABuscar })
      .catch((err) => {
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
      dateEnvioNotificacion: `${dateAcuerdo} ${objDate.getHours()}:${objDate.getMinutes()}`,
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
  const { email, contrasena } = req.body;
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(id);

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
  }

  const modeloAjustes = modelos.ajuste;

  const ajusteExistente = await modeloAjustes.find({ idUsuario: id });
  if (ajusteExistente.length === 0) {
    const ajuste = await modeloAjustes({
      idUsuario: id,
      idLangPred: req.body.idLangPred,
    })
      .save()
      .catch((err) => {
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
      .catch((err) => {
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

  const usuarioBuscado = await modeloUsuarios.findOneAndUpdate(
    { validationToken },
    { validado: true }
  );
  if (usuarioBuscado) {
    res.writeHead(200, { "Content-Type": "text/html" });
    readHTMLFile("emailConfirmado", (err, html) => {
      const template = handlebars.compile(html);
      const htmlToSend = template({
        ipMaquina,
      });
      res.write(htmlToSend);
      res.end();
    });
  } else {
    res.writeHead(204, headerResponse);
    res.write("No email");
    res.end();
  }
};

exports.getEmailWithIdPerfil = async (req, res, modelos) => {
  const { idPerfil } = req.params;
  const modeloUsuario = modelos.usuario;

  const usuarioFound = await modeloUsuario.findOne({ idPerfil }, "email");
  res.writeHead(200, { "Content-Type": "text/plain" });
  const response = usuarioFound !== null ? usuarioFound.email : "Vacio";
  res.write(response);
  res.end();
};

exports.getNotificationsWithIdUsuario = async (req, res, modelos) => {
  const { idUsuario } = req.params;
  const { email, contrasena } = req.body;
  const modeloUsuario = modelos.usuario;
  const modeloNotificacion = modelos.notificacion;
  const validUser = await modeloUsuario.findById(idUsuario);
  if (validUser.email === email && validUser.contrasena === contrasena) {
    const notificaciones = await modeloNotificacion.find({
      idUsuario,
      visto: false,
    });
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(notificaciones));
    res.end();
  } else {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
  }
};

exports.getIdUsuarioConIdPerfil = async (req, res, modelos) => {
  const { idPerfil } = req.params;

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil });
  if (usuario === null) {
    res.writeHead(404, headerResponse);
    res.write("Usuario no encontrado");
    res.end();
    return;
  }
  let id = usuario._id.toString();
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write(id);
  res.end();
};

exports.patchPassword = async (req, res, modelos) => {
  const { idUsuario } = req.params;
  const { contrasena, newPassword, email } = req.body;
  const modeloUsuarios = modelos.usuario;
  const modeloEncontrado = await modeloUsuarios.findById(idUsuario);

  if (
    modeloEncontrado.email === email &&
    modeloEncontrado.contrasena === contrasena
  ) {
    modeloUsuarios
      .findByIdAndUpdate(idUsuario, { contrasena: newPassword })
      .then((doc) => {
        res.writeHead(200, headerResponse);
        res.write(JSON.stringify(doc));
      })
      .catch((err) => {
        console.log(err);
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
      })
      .finally(() => {
        res.end();
      });
  } else {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
  }
};

exports.checkIfEmailExists = async (req, res, modelos) => {
  const { email } = req.params;
  const modeloUsuarios = modelos.usuario;

  const emailEncontrado = await modeloUsuarios.findOne({ email });

  const response = emailEncontrado !== null ? "True" : "Vacio";
  res.writeHead(200, headerResponse);
  res.write(response);
  res.end();
};

exports.newNotification = async (req, res, modelos) => {
  const {
    idUsuario,
    idRemitente,
    tipoNotificacion,
    valorGestion,
    email,
    contrasena,
    acuerdo,
  } = req.body;
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(idRemitente);

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }
  const objetivo = await modeloUsuario.findById(idUsuario);

  if (objetivo === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  const modeloNotificacion = modelos.notificacion;
  const objToday = new Date();
  const notificacion = new modeloNotificacion({
    idUsuario,
    idRemitente,
    tipoNotificacion,
    acuerdo,
    valorGestion,
    visto: false,
    show: true,
    dateEnvioNotificacion: `${getTodayDate()} ${objToday.getHours()}:${objToday.getMinutes()}`,
  });
  notificacion
    .save()
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(() => {
      res.end();
    });
};

exports.getAcuerdoStatus = async (req, res, modelos) => {
  const { idAcuerdo } = req.params;
  const { whoAmI, email, contrasena } = req.body;

  const modeloAcuerdo = modelos.acuerdo;
  const acuerdo = await modeloAcuerdo.findById(idAcuerdo);
  const columna = whoAmI === "Cliente" ? "idCliente" : "idCuidador";
  const idUsuario = acuerdo[columna];
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil: idUsuario });
  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(acuerdo.estadoAcuerdo));
  res.end();
};

exports.terminarAcuerdo = async (req, res, modelos) => {
  const { idAcuerdo } = req.params;
  const { whoAmI, email, contrasena } = req.body;

  const modeloAcuerdo = modelos.acuerdo;
  const acuerdo = await modeloAcuerdo.findById(idAcuerdo);
  const columna = whoAmI === "Cliente" ? "idCliente" : "idCuidador";
  const idPerfil = acuerdo[columna];
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  modeloAcuerdo
    .findByIdAndUpdate(idAcuerdo, {
      estadoAcuerdo: 2,
      dateFinAcuerdo: getTodayDate(),
    })
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(() => {
      res.end();
    });
};

exports.gestionarAcuerdo = async (req, res, modelos) => {
  const { idAcuerdo } = req.params;
  const { estadoAcuerdo, email, contrasena, whoAmI } = req.body;

  const modeloAcuerdo = modelos.acuerdo;
  const acuerdo = await modeloAcuerdo.findById(idAcuerdo);
  const columna = whoAmI === "Cliente" ? "idCliente" : "idCuidador";
  const idPerfil = acuerdo[columna];
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  modeloAcuerdo
    .findByIdAndUpdate(idAcuerdo, {
      estadoAcuerdo,
    })
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(() => {
      res.end();
    });
};

exports.checkIfAcuerdoExists = async (req, res, modelos) => {
  const { idCliente, idCuidador, email, contrasena, whoAmI } = req.body;

  const modeloUsuario = modelos.usuario;
  const idPerfil = whoAmI === "Cliente" ? idCliente : idCuidador;
  const usuario = await modeloUsuario.findOne({ idPerfil });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  const modeloAcuerdos = modelos.acuerdo;
  const acuerdo = await modeloAcuerdos.findOne({
    idCliente,
    idCuidador,
    $or: [{ estadoAcuerdo: 1 }, { estadoAcuerdo: 0 }],
  });

  const response = acuerdo !== null ? "Exists" : "Vacio";

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write(response);
  res.end();
};

exports.newAcuerdo = async (req, res, modelos) => {
  const {
    whoAmI,
    idCuidador,
    idCliente,
    email,
    contrasena,
    diasAcordados,
    tituloAcuerdo,
    pueblo,
    descripcionAcuerdo,
    origenAcuerdo,
  } = req.body;

  const modeloUsuario = modelos.usuario;
  const idPerfil = whoAmI === "Cliente" ? idCliente : idCuidador;
  const usuario = await modeloUsuario.findOne({ idPerfil });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  //Ahora se comprobara si el otro usuario existe por integridad de datos
  const elOtroModeloNombre = whoAmI === "Cliente" ? "cuidador" : "cliente";
  const elOtroId = whoAmI === "Cliente" ? idCuidador : idCliente;
  const elOtroModelo = modelos[elOtroModeloNombre];
  const elOtro = await elOtroModelo.findById(elOtroId);

  if (elOtro === null) {
    res.writeHead(405, headerResponse);
    res.write("No existe el otro usuario");
    res.end();
    return;
  }

  // Ahora se comprueba si ya existe un acuerdo
  const modeloAcuerdos = modelos.acuerdo;
  const acuerdo = await modeloAcuerdos.findOne({
    idCliente,
    idCuidador,
    $or: [{ estadoAcuerdo: 1 }, { estadoAcuerdo: 0 }],
  });

  if (acuerdo !== null) {
    res.writeHead(405, headerResponse);
    res.write("El acuerdo ya existe");
    res.end();
    return;
  }

  // Insertamos el acuerdo porque es v?lido
  const modeloConfigurado = new modeloAcuerdos({
    idCuidador,
    idCliente,
    diasAcordados,
    tituloAcuerdo,
    pueblo,
    descripcionAcuerdo,
    origenAcuerdo,
    estadoAcuerdo: 0,
    dateAcuerdo: getTodayDate(),
  });
  modeloConfigurado
    .save()
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(() => {
      res.end();
    });
};

exports.getMisAnuncios = async (req, res, modelos) => {
  // Por ahora este procedure no tiene sentido ya que el modelo anuncio es publica y no hace falt autentificacion
  // Aun asi pretendo hacer una tabla de estadisticas para que el usuario pueda ver cuantas personas han visto su anunctio, etc...
  // Para esos datos si que se necesitaria autentificacion y usaria esta procedure

  const { idCliente, email, contrasena } = req.body;
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({ idPerfil: idCliente });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  const modeloAnuncios = modelos.anuncio;
  modeloAnuncios
    .find({
      idCliente,
      show: true,
    })
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally(() => {
      res.end();
    });
};

exports.patchAnuncio = async (req, res, modelos) => {
  const { idAnuncio } = req.params;
  const {
    titulo,
    descripcion,
    horario,
    pueblo,
    publico,
    precio,
    email,
    contrasena,
    imgAnuncio,
  } = req.body;
  const publicoShouldBe = ["ninos", "terceraEdad", "necesidadEspecial"];
  if (titulo === "") {
    res.writeHead(405, headerResponse);
    res.write("Falta el titulo");
    res.end();
    return;
  }
  if (descripcion === "") {
    res.writeHead(405, headerResponse);
    res.write("Falta la descripcion");
    res.end();
    return;
  }
  if (precio === "") {
    res.writeHead(405, headerResponse);
    res.write("Falta el precio");
    res.end();
    return;
  }
  if (pueblo.length === 0) {
    res.writeHead(405, headerResponse);
    res.write("Faltan las ubicaciones");
    res.end();
    return;
  }
  if (horario.length === 0) {
    res.writeHead(405, headerResponse);
    res.write("Falta el horario");
    res.end();
    return;
  }

  let puebloIsValid = true;
  pueblo.map((pueblo) => {
    if (typeof pueblo !== "string") {
      puebloIsValid = false;
    }
  });
  if (!puebloIsValid) {
    res.writeHead(405, headerResponse);
    res.write("Ubicaciones incorrecto");
    res.end();
    return;
  }
  let horarioIsValid = true;
  horario.map((dia) => {
    if (!dia.dia) {
      horarioIsValid = false;
      return;
    }
  });
  if (!horarioIsValid) {
    res.writeHead(405, headerResponse);
    res.write("Horario incorrecto");
    res.end();
    return;
  }
  if (!publicoShouldBe.includes(publico)) {
    res.writeHead(405, headerResponse);
    res.write("Publico incorrecto");
    res.end();
    return;
  }

  const modeloAnuncios = modelos.anuncio;
  const modeloUsuario = modelos.usuario;
  const modeloBuscado = await modeloAnuncios.findById(idAnuncio);
  const idCliente = modeloBuscado.idCliente;
  const usuario = await modeloUsuario.findOne({
    idPerfil: idCliente,
  });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  let formData = {
    titulo,
    descripcion,
    horario,
    pueblo,
    publico,
    precio,
  };

  if (imgAnuncio !== null) {
    const direcFoto = getRandomString(20);
    writeImage(direcFoto, imgAnuncio);
    formData.direcFoto = direcFoto;
  }

  modeloAnuncios
    .findByIdAndUpdate(idAnuncio, formData)
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.deleteAnuncio = async (req, res, modelos) => {
  const { idAnuncio } = req.params;
  const { email, contrasena } = req.body;

  const modeloUsuario = modelos.usuario;
  const modeloAnuncio = modelos.anuncio;

  const anuncioBuscado = await modeloAnuncio.findById(idAnuncio);
  const idCliente = anuncioBuscado.idCliente;
  const usuario = await modeloUsuario.findOne({
    idPerfil: idCliente,
  });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  modeloAnuncio
    .findByIdAndUpdate(idAnuncio, {
      show: false,
    })
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.registerAnuncioVisita = async (req, res, modelos) => {
  const { idAnuncio } = req.params;
  const { email, contrasena } = req.body;

  let usuario;

  if (email && contrasena) {
    const modeloUsuario = modelos.usuario;
    usuario = await modeloUsuario.findOne({
      email,
      contrasena,
    });

    if (usuario === null) {
      res.writeHead(405, headerResponse);
      res.write("Operacion denegada");
      res.end();
      return;
    }
  }

  const formData = {
    idAnuncio,
    idUsuario: usuario ? usuario._id : null,
    fechaVisto: moment().tz("Europe/Madrid").valueOf(),
  };

  const modeloAnuncioVisita = modelos.anuncioVisita;
  modeloAnuncioVisita(formData)
    .save()
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.getAnuncioVisitas = async (req, res, modelos) => {
  const { idAnuncio } = req.params;
  const { email, contrasena } = req.body;

  const modeloAnuncio = modelos.anuncio;
  const anuncioBuscado = await modeloAnuncio.findById(idAnuncio);
  const idPerfil = anuncioBuscado.idCliente;

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({
    idPerfil,
  });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  let resultado = {};

  const modeloAnuncioVisita = modelos.anuncioVisita;
  const visitasConLogin = await modeloAnuncioVisita.find({
    idAnuncio,
    idUsuario: {
      $ne: null,
    },
  });
  const visitasSinLogin = await modeloAnuncioVisita.find({
    idAnuncio,
    idUsuario: null,
  });

  resultado.visitasConLogin = visitasConLogin;
  resultado.visitasSinLogin = visitasSinLogin;

  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(resultado));
  res.end();
};

exports.registerCuidadorVisita = async (req, res, modelos) => {
  const { idCuidador } = req.params;
  const { email, contrasena } = req.body;

  let usuario;

  if (email && contrasena) {
    const modeloUsuario = modelos.usuario;
    usuario = await modeloUsuario.findOne({
      email,
      contrasena,
    });

    if (usuario === null) {
      res.writeHead(405, headerResponse);
      res.write("Operacion denegada");
      res.end();
      return;
    }
  }

  const formData = {
    idCuidador,
    idUsuario: usuario ? usuario._id : null,
    fechaVisto: moment().tz("Europe/Madrid").valueOf(),
  };

  const modeloCuidadorVisita = modelos.cuidadorVisita;
  modeloCuidadorVisita(formData)
    .save()
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.getCuidadorVisitas = async (req, res, modelos) => {
  const { idCuidador } = req.params;
  const { email, contrasena } = req.body;

  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findOne({
    idPerfil: idCuidador,
  });

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  let resultado = {};

  const modeloCuidadorVisita = modelos.cuidadorVisita;
  const visitasConLogin = await modeloCuidadorVisita.find({
    idCuidador,
    idUsuario: {
      $ne: null,
    },
  });
  const visitasSinLogin = await modeloCuidadorVisita.find({
    idCuidador,
    idUsuario: null,
  });

  resultado.visitasConLogin = visitasConLogin;
  resultado.visitasSinLogin = visitasSinLogin;

  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(resultado));
  res.end();
};

exports.getCuidadoresConValoraciones = async (req, res, modelos) => {
  const { requiredCards, filterUbicacion, coords, maxDistance } = req.query;
  const modeloCuidadores = modelos.cuidador;
  const resultado = [];
  let cuidadoresFilter = {
    isPublic: true
  };
  if(filterUbicacion !== undefined){
    cuidadoresFilter.ubicaciones = filterUbicacion;
  }
  const cuidadores = await modeloCuidadores.find(
    cuidadoresFilter,
    null,
    {
      limit: parseInt(requiredCards),
    }
  );
  const modeloUsuarios = modelos.usuario;
  const modeloValoraciones = modelos.valoracion;
  for (let index in cuidadores) {
    const usuario = await modeloUsuarios.findOne({
      idPerfil: cuidadores[index]._id,
    });
    const idUsuario = usuario._id;
    const valoraciones = await modeloValoraciones.find({
      idUsuario,
    });
    resultado.push({
      cuidador: cuidadores[index],
      valoraciones: valoraciones,
    });
  }

  const ifMaxDistance = maxDistance || 30;
  const resultadoConCoords = [];

  if (coords) {
    const objCoords = JSON.parse(coords);
    // TODO Filtrar `resultado` y medir la distancia del pueblo configurado del cuidador y pasado por cliente
    resultado.filter(eachItem => {
      let shouldBeSend = false;
      let minDistancia = 100000000;
      eachItem.cuidador.ubicaciones.forEach(ubicacion => {
        const ubicacionCoords = coordsMunicipios.find(coord => coord.nombreCiudad === ubicacion);
        if (ubicacionCoords){
          const { latitud, longitud } = ubicacionCoords;
          const clienteLatitud = objCoords.latitud;
          const clienteLongitud = objCoords.longitud;
          const distancia = parseInt(getKmFromCoords(clienteLatitud, clienteLongitud, latitud, longitud));
          
          // Si el cliente esta a mas de 30 KM del cuidador (o la maxima distancia configurada) no aparecera en la aplicacion web
          if (!shouldBeSend) {
            shouldBeSend = distancia < ifMaxDistance;
          }          

          if (minDistancia > distancia) {
            minDistancia = distancia;
          }
        } else {
          shouldBeSend = false;
        }
      });
      if (shouldBeSend) {
        resultadoConCoords.push(Object.assign({ ...eachItem, distancia: minDistancia }));
      }
    }); 
  }

  resultadoConCoords.sort((a, b) => a.distancia > b.distancia ? 1 : -1);
  
  // Si se han calculado las distancias, enviará el array ordenado por distancia, si no va a devolver los cuidadores con un orden random
  const enviarResultado = resultadoConCoords.length > 0 ? resultadoConCoords : shuffleArray(resultado);
  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(enviarResultado));
  res.end();
};

exports.postNewValoracion = async (req, res, modelos) => {
  const {
    idUsuario,
    idValorador,
    idAcuerdo,
    valor,
    comentario,
    email,
    contrasena,
    fechaValorado,
  } = req.body;

  //Primero validar que el idValorador(El que envia esta peticion) es autentico
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(idValorador);

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
    return;
  }
  //Comprobar que el idUsuario existe
  const usuarioValorar = await modeloUsuario.findById(idUsuario);
  if (usuarioValorar === null) {
    res.writeHead(405, headerResponse);
    res.write("El usuario a valorar no existe");
    res.end();
    return;
  }

  //Comprobar que el acuerdo existe y que se ha terminado
  const modeloAcuerdo = modelos.acuerdo;
  const acuerdo = await modeloAcuerdo.findById(idAcuerdo);

  if (acuerdo == null) {
    res.writeHead(405, headerResponse);
    res.write("El acuerdo no existe");
    res.end();
    return;
  }

  if (acuerdo.estadoAcuerdo !== 2) {
    res.writeHead(405, headerResponse);
    res.write("El acuerdo no está terminado");
    res.end();
    return;
  }
  const modeloValoracion = modelos.valoracion;
  //Comprobar que no hay ninguna valoracion con ese acuerdo
  const acuerdoRepetido = await modeloValoracion.findOne({
    idAcuerdo,
  });

  if (acuerdoRepetido !== null) {
    res.writeHead(405, headerResponse);
    res.write("Ya existe una valoracion con este acuerdo");
    res.end();
    return;
  }

  //Por ultimo registrar la valoracion para el idUsuario
  modeloValoracion({
    idUsuario,
    idValorador,
    idAcuerdo,
    valor,
    comentario,
    fechaValorado,
  })
    .save()
    .then((doc) => {
      res.writeHead(200, headerResponse);
      res.write(JSON.stringify(doc));
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
    })
    .finally((fin) => {
      res.end();
    });
};

exports.getValoracionesDelCuidador = async (req, res, modelos) => {
  const { idUsuario } = req.params;

  const modeloValoracion = modelos.valoracion;
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(idUsuario);

  if (usuario === null) {
    res.writeHead(405, headerResponse);
    res.write("El usuario no existe");
    res.end();
    return;
  }

  const valoraciones = await modeloValoracion
    .find({
      idUsuario: usuario._id,
    })
    .populate({
      path: "idValorador",
      populate: "idPerfil",
    });
  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(valoraciones));
  res.end();
};

exports.patchMaxDistance = async (req, res, modelos) => {
  const { id } = req.params;
  const { email, contrasena, maxDistance } = req.body;
  const modeloUsuario = modelos.usuario;
  const usuario = await modeloUsuario.findById(id);

  if (usuario.email !== email || usuario.contrasena !== contrasena) {
    res.writeHead(405, headerResponse);
    res.write("Operacion denegada");
    res.end();
  }

  if (!maxDistance) {
    res.writeHead(405, headerResponse);
    res.write("Falta maxDistance");
    res.end();
  }

  const modeloAjustes = modelos.ajuste;

  const ajusteExistente = await modeloAjustes.find({ idUsuario: id });
  if (ajusteExistente.length === 0) {
    const ajuste = await modeloAjustes({
      idUsuario: id,
      maxDistance,
    })
      .save()
      .catch((err) => {
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(ajuste));
    res.end();
  } else {
    const ajuste = await modeloAjustes
      .findOneAndUpdate({ idUsuario: id }, { maxDistance })
      .catch((err) => {
        res.writeHead(500, headerResponse);
        res.write(JSON.stringify(err));
        res.end();
      });
    res.writeHead(200, headerResponse);
    res.write(JSON.stringify(ajuste));
    res.end();
  }
}
