import { SAVE_USER, INITIALIZE_USER } from "../constants/user";

const initialState = {
  _id: "",
  _idUsuario: "",
  nombre: "",
  apellido1: "",
  apellido2: "",
  fechaNacimiento: "",
  sexo: "",
  direcFoto: "",
  direcFotoContacto: "",
  descripcion: "",
  ubicaciones: "",
  publicoDisponible: {},
  email: "",
  contrasena: "",
  telefonoMovil: "",
  telefonoFijo: "",
  isPublic: "",
  precioPorPublico: {},
  diasDisponible: {},
  valoracionMedia: "",
  tipoUsuario: "",
  idLangPred: "",
  tokenId: "" // Google Token
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_USER:
      return Object.assign({}, state, {
        _id: action.payload._id || state._id,
        _idUsuario: action.payload._idUsuario || state._idUsuario,
        nombre: action.payload.nombre || state.nombre,
        apellido1: action.payload.apellido1 || state.apellido1,
        apellido2: action.payload.apellido2 || state.apellido2,
        fechaNacimiento: action.payload.fechaNacimiento || state.fechaNacimiento,
        sexo: action.payload.sexo || state.sexo,
        direcFoto: action.payload.direcFoto || state.direcFoto,
        direcFotoContacto: action.payload.direcFotoContacto || state.direcFotoContacto,
        descripcion: action.payload.descripcion || state.descripcion,
        ubicaciones: action.payload.ubicaciones || state.ubicaciones,
        publicoDisponible: action.payload.publicoDisponible || state.publicoDisponible,
        email: action.payload.email || state.email,
        contrasena: action.payload.contrasena || state.contrasena,
        telefonoMovil: action.payload.telefonoMovil || state.telefonoMovil,
        telefonoFijo: action.payload.telefonoFijo || state.telefonoFijo,
        isPublic: typeof action.payload.isPublic != "undefined" ? action.payload.isPublic : state.isPublic,
        precioPorPublico: action.payload.precioPorPublico || state.precioPorPublico,
        diasDisponible: action.payload.diasDisponible || state.diasDisponible,
        valoracionMedia: action.payload.valoracionMedia || state.valoracionMedia, 
        tipoUsuario: action.payload.tipoUsuario || state.tipoUsuario,
        idLangPred: action.payload.idLangPred || state.idLangPred,
        tokenId: action.payload.tokenId || state.tokenId
      });
    case INITIALIZE_USER:
        return Object.assign({},state, initialState);
    default:
      return state;
  }
}

export default reducer;
