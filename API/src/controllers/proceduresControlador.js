const {
  writeImage,
  getRandomString,
  getTodayDate,
  caesarShift,
  readHTMLFile,
  shuffleArray,
  verifyGoogleToken
} = require("../../util/funciones");
const headerResponse = require("../../util/headerResponse");
const ipMaquina = require("../../util/ipMaquina");
const protocol = require('../../util/protocol');
const handlebars = require("handlebars");
const momentTimezone = require("moment-timezone");
const moment = require('moment');
const path = require('path');
const { adminToken } = require('../../util/adminToken');
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
  const { email, contrasena, tokenId } = req.body;

  if (typeof email == "undefined") {
    res.writeHead(500, headerResponse);
    res.write("Parametros incorrectos");
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const modeloAjuste = modelos.ajuste;
  const filtros = {
    email: email,
  };

  let usu = await modeloUsuario.findOne(filtros);
  if (usu !== null) {
    let verifyError = false;
    if (usu.registeredByGoogle)
    {
      // Verificar que el token sea correcto
      const googleVerify = await verifyGoogleToken(tokenId).catch((err) => {
        verifyError = true;
      });
    }
    if (!usu.registeredByGoogle && tokenId === undefined && usu.contrasena !== contrasena)
      usu = null;
    if (verifyError)
      usu = null;
  }
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
          if (moment().isBefore(moment(respuesta.idUsuario.bannedUntilDate))) {
            res.writeHead(401, headerResponse);
            res.write(JSON.stringify(respuesta));
            res.end();
            return;
          }
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
          if (moment().isBefore(moment(respuesta.bannedUntilDate))) {
            res.writeHead(401, headerResponse);
            res.write(JSON.stringify(respuesta));
            res.end();
            return;
          }
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
  
  const ifMaxDistance = maxDistance || 150;
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
    imgAvatarB64,
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
  if (imgAvatarB64.length > 0) {
    //Se ha elegido una imagen para el perfil
    codAvatar = getRandomString(20);
    writeImage(codAvatar, imgAvatarB64);
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
    imgAvatarB64,
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
  if (imgAvatarB64.length > 0) {
    codAvatar = getRandomString(20);
    writeImage(codAvatar, imgAvatarB64);
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
    imgAvatarB64,
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
  if (imgAvatarB64.length > 0) {
    codAvatar = getRandomString(20);
    writeImage(codAvatar, imgAvatarB64);
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
    imgAvatarB64,
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
  if (imgAvatarB64.length > 0) {
    codAvatar = getRandomString(20);
    writeImage(codAvatar, imgAvatarB64);
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
    fechaVisto: momentTimezone().tz("Europe/Madrid").valueOf(),
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
    fechaVisto: momentTimezone().tz("Europe/Madrid").valueOf(),
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
  const { requiredCards, filterUbicacion, filterCategoria, coords, maxDistance, todos } = req.query;
  const modeloCuidadores = modelos.cuidador;
  const resultado = [];
  let cuidadoresFilter = {
    isPublic: true
  };
  if(filterUbicacion !== undefined && filterUbicacion.length > 0){
    cuidadoresFilter.ubicaciones = filterUbicacion;
  }
  if (filterCategoria !== undefined) {
    const objFilterCategoria = JSON.parse(filterCategoria);
    const auxCategoryFilter = [];
    Object.keys(objFilterCategoria).forEach(category => {
      if (objFilterCategoria[category] === true) {
        let auxFilterObj = {};
        auxFilterObj[`publicoDisponible.${category}`] = true;
        auxCategoryFilter.push(auxFilterObj);
      }
    });
    if (auxCategoryFilter.length > 0) {
      cuidadoresFilter.$or = auxCategoryFilter;
    }
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
    // Usuario filter es para el filtro del usuario. Si le paso todos desde ZaintzaAdmin me mostrará todos los cuidadores,
    // si no le paso solo los validados, ya que estará llamando desde Zaintza.eus
    let usuarioFilter;
    if (parseInt(todos) === 1) {
      usuarioFilter = {
        idPerfil: cuidadores[index]._id
      }
    } else {
      usuarioFilter = {
        idPerfil: cuidadores[index]._id,
        validado: true
      }
    }
    const usuario = await modeloUsuarios.findOne(usuarioFilter);
    // Usuario será null si el usuario no está validado, en ese caso no hay que devolver la informacion
    if (usuario === null)
      continue;
    const idUsuario = usuario._id;
    const valoraciones = await modeloValoraciones.find({
      idUsuario,
    });
    resultado.push({
      cuidador: cuidadores[index],
      valoraciones: valoraciones,
    });
  }

  const ifMaxDistance = maxDistance || 150;
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
    esAnonimo
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
  const valoracion = await modeloValoracion({
    idUsuario,
    idValorador,
    idAcuerdo,
    valor,
    comentario,
    fechaValorado,
    esAnonimo
  })
    .save()
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
      res.end();
      return;
    });
  
  /**
   * Mandar notificacion al usuario
   */
  const modeloNotificacion = modelos.notificacion;
  await modeloNotificacion({
    idUsuario,
    idRemitente: idValorador,
    tipoNotificacion: "Valoracion",
    visto: false,
    valoracion: valor,
    valoracionDetalle: comentario,
    dateEnvioNotificacion: Date.now()
  })
    .save()
    .catch((err) => {
      console.log(err);
      res.writeHead(500, headerResponse);
      res.write(JSON.stringify(err));
      res.end();
      return;
    });
  res.writeHead(200, headerResponse);
  res.write(JSON.stringify(valoracion));
  res.end();
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

exports.banUser = async (req, res, modelos) => {
  const { idCuidador, banDays, token } = req.body;

  if (token !== adminToken) {
    res.writeHead(400, headerResponse);
    res.write('No authorization');
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const foundUser = await modeloUsuario.findOne({ idPerfil: idCuidador });
  if (!foundUser) {
    res.writeHead(400, headerResponse);
    res.write('No user found');
    res.end();
    return;
  }
  await modeloUsuario.findByIdAndUpdate(foundUser._id, {
    bannedUntilDate: moment().add(banDays, 'days').toDate()
  });
  res.writeHead(200, headerResponse);
  res.end();
  return;  
}

exports.unBanUser = async (req, res, modelos) => {
  const { idCuidador, token } = req.body;
  
  if (token !== adminToken) {
    res.writeHead(400, headerResponse);
    res.write('No authorization');
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  const foundUser = await modeloUsuario.findOne({ idPerfil: idCuidador });
  if (!foundUser) {
    res.writeHead(400, headerResponse);
    res.write('No user found');
    res.end();
    return;
  }
  await modeloUsuario.findByIdAndUpdate(foundUser._id, {
    bannedUntilDate: moment().subtract(1, 'days').toDate()
  });
  res.writeHead(200, headerResponse);
  res.end();
  return;  
}

exports.deleteCuidadorImg = async (req, res, modelos) => {
  const { idCuidador, token } = req.body;
  
  if (token !== adminToken) {
    res.writeHead(400, headerResponse);
    res.write('No authorization');
    res.end();
    return;
  }

  const modeloCuidador = modelos.cuidador;

  await modeloCuidador.findByIdAndUpdate(idCuidador, {
    direcFotoContacto: 'noImage'
  })
    .catch(() => {
      res.writeHead(500, headerResponse);
      res.write('Couldnt update img');
      res.end();
      return;
    });
  res.writeHead(200, headerResponse);
  res.end();
}

exports.isUserBanned = async (req, res, modelos) => {
  const { idPerfil } = req.params;

  const modeloUsuario = modelos.usuario;
  const foundUser = await modeloUsuario.findOne({ idPerfil });
  if (!foundUser) {
    res.writeHead(400, headerResponse);
    res.write('No user found');
    res.end();
    return;
  }

  if (moment().isBefore(foundUser.bannedUntilDate)) {
    res.writeHead(200, headerResponse);
    res.write('true');
    res.end();
  } else {
    res.writeHead(200, headerResponse);
    res.write('false');
    res.end();
  }
}

exports.newResetPasswordRequest = async (req, res, modelos) => {
  const { email } = req.body;

  const modeloUsuario = modelos.usuario;
  const foundUser = await modeloUsuario.findOne({ email });

  if (!foundUser) {
    res.writeHead(400, headerResponse);
    res.write('No user found');
    res.end();
    return;
  }

  const modeloResetPassword = modelos.resetPasswordRequest;
  const validationToken = getRandomString(20);

  const resetConfigurado = new modeloResetPassword({
    email,
    validationToken,
    fechaRequest: moment().toDate()
  });

  await resetConfigurado.save();

  res.writeHead(200, headerResponse);
  res.end();
}

exports.formResetPassword = async (req, res, modelos) => {
  const { validationToken } = req.query;

  const modeloResetPassword = modelos.resetPasswordRequest;
  const foundRequest = await modeloResetPassword.findOne({ validationToken });

  if (!foundRequest) {
    res.writeHead(400, headerResponse);
    res.write('No request found');
    res.end();
    return;
  }

  if (moment().isAfter(moment(foundRequest.fechaRequest).add(1, 'days'))) {
    res.writeHead(200, headerResponse);
    res.write('Request caducado');
    res.end();
    return;
  }

  readHTMLFile('formResetPassword', (err, html) => {
    if (!err) {
      const template = handlebars.compile(html);
      const htmlToSend = template({
        ipMaquina,
        protocol
      });
      res.status(200);
      res.set('Content-Type', 'text/html');
      res.send(htmlToSend);
    } else {
      res.writeHead(500, headerResponse);
      res.write('HTML Compile error');
      res.end();
    }
  });
}

exports.resetPassword = async (req, res, modelos) => {
  const { validationToken, password } = req.body;

  const modeloResetPassword = modelos.resetPasswordRequest;
  const foundRequest = await modeloResetPassword.findOne({ validationToken });

  if (!foundRequest) {
    res.writeHead(400, headerResponse);
    res.write('No request found');
    res.end();
    return;
  }

  if (moment().isAfter(moment(foundRequest.fechaRequest).add(1, 'days'))) {
    res.writeHead(400, headerResponse);
    res.write('Request caducado');
    res.end();
    return;
  }

  if (!password) {
    res.writeHead(400, headerResponse);
    res.write('No password found');
    res.end();
    return;
  }

  if (password.length < 6) {
    res.writeHead(400, headerResponse);
    res.write('Password too weak');
    res.end();
    return;
  }

  const modeloUsuario = modelos.usuario;
  await modeloUsuario.findOneAndUpdate({ email: foundRequest.email }, { contrasena: password });

  res.writeHead(200, headerResponse);
  res.write('Contraseña cambiada');
  res.end();
}

exports.postNewUsuario = async (req, res, modelos) => {
  const {
    email,
    contrasena,
    entidad
  } = req.body;

  if (
    typeof email == "undefined" ||
    typeof contrasena == "undefined" ||
    typeof entidad == "undefined"
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

  if (entidad !== "Cuidador" && entidad !== "Cliente") {
    res.writeHead(405, headerResponse);
    res.write("Entidad incorrecta");
    res.end();
    return;
  }

  const modeloEntidad = entidad === "Cuidador" ? modelos.cuidador : modelos.cliente;
  const insertedEntidad = await modeloEntidad({}).save();

  const modeloUsuarios = modelos.usuario;
  const insertedUsuario = await modeloUsuarios({
    email: email,
    contrasena: contrasena,
    tipoUsuario: entidad,
    idPerfil: insertedEntidad._id
  }).save();

  const modeloAjustes = modelos.ajuste;
  const insertedAjustes = await modeloAjustes({
    idUsuario: insertedUsuario._id
  }).save();

  res.writeHead(200, headerResponse);
  res.write(
    JSON.stringify({
      idUsuario: insertedUsuario._id,
      idPerfil: insertedEntidad._id,
    })
  );
  res.end();
};

exports.postNewUsuarioWithGoogle = async (req, res, modelos) => {
  const {
    email,
    entidad,
    direcFoto
  } = req.body;

  if (
    typeof email == "undefined" ||
    typeof entidad == "undefined"
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

  if (entidad !== "Cuidador" && entidad !== "Cliente") {
    res.writeHead(405, headerResponse);
    res.write("Entidad incorrecta");
    res.end();
    return;
  }

  const modeloEntidad = entidad === "Cuidador" ? modelos.cuidador : modelos.cliente;
  const insertedEntidad = await modeloEntidad({
    direcFoto
  }).save();

  const modeloUsuarios = modelos.usuario;
  const insertedUsuario = await modeloUsuarios({
    email: email,
    contrasena: getRandomString(15),
    tipoUsuario: entidad,
    idPerfil: insertedEntidad._id,
    validado: true,
    registeredByGoogle: true
  }).save();

  const modeloAjustes = modelos.ajuste;
  const insertedAjustes = await modeloAjustes({
    idUsuario: insertedUsuario._id
  }).save();

  res.writeHead(200, headerResponse);
  res.write(
    JSON.stringify({
      idUsuario: insertedUsuario._id,
      idPerfil: insertedEntidad._id,
    })
  );
  res.end();
};