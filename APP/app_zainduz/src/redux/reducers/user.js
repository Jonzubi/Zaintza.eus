import { SAVE_USER, INITIALIZE_USER } from "../constants/user";

const initialState = {
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
  telefono: {},
  isPublic: "",
  precioPorPublico: {},
  diasDisponible: {},
  valoracionMedia: "",
  tipoUsuario: ""
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_USER:
      return Object.assign({}, state, {
        nombre: action.payload.nombre,
        apellido1: action.payload.apellido1,
        apellido2: action.payload.apellido2,
        fechaNacimiento: action.payload.fechaNacimiento,
        sexo: action.payload.sexo,
        direcFoto: action.payload.direcFoto,
        direcFotoContacto: action.payload.direcFotoContacto,
        descripcion: action.payload.descripcion,
        ubicaciones: action.payload.ubicaciones,
        publicoDisponible: action.payload.publicoDisponible,
        email: action.payload.email,
        contrasena: action.payload.contrasena,
        telefono: action.payload.telefono,
        isPublic: action.payload.isPublic,
        precioPorPublico: action.payload.precioPorPublico,
        diasDisponible: action.payload.diasDisponible,
        valoracionMedia: action.payload.valoracionMedia, 
        tipoUsuario: action.payload.tipoUsuario
      });
    case INITIALIZE_USER:
        return Object.assign({},state, initialState);
    default:
      return state;
  }
}

export default reducer;
