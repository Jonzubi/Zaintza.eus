import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cogoToast from "cogo-toast";
import Avatar from "react-avatar-edit";
import {
  faMale,
  faFemale,
  faPlusCircle,
  faMinusCircle,
  faUser,
  faCalendarAlt,
  faAt,
  faKey,
  faMobileAlt,
  faPhoneSquareAlt,
  faClock,
  faHome,
  faEuroSign,
  faPenSquare,
  faVenusMars,
  faUsers,
  faUserCircle,
  faPortrait,
} from "@fortawesome/free-solid-svg-icons";
import i18next from "i18next";
import { saveUserSession } from "../redux/actions/user";
import SocketContext from "../socketio/socket-context";
import ipMaquina from "../util/ipMaquinaAPI";
import { trans, isValidEmail } from "../util/funciones";
import ContactImageUploader from "../components/contactImageUploader";

class FormCuidador extends React.Component {
  constructor(props) {
    super(props);

    this.requiredStates = [
      "txtNombre",
      "txtSexo",
      "txtFechaNacimiento",
      "txtMovil",
      "ubicaciones",
      "txtDescripcion",
    ];
    //El array de abajo es para traducir el error
    this.requiredStatesTraduc = {
      txtNombre: "registerFormCuidadores.nombre",
      txtSexo: "registerFormCuidadores.sexo",
      txtFechaNacimiento: "registerFormCuidadores.fechaNac",
      txtMovil: "registerFormCuidadores.movil",
      ubicaciones: "registerFormCuidadores.pueblosDisponible",
      txtDescripcion: "registerFormCuidadores.descripcion",
    };

    const {
      isProfileView,
      nombre,
      apellido1,
      apellido2,
      sexo,
      fechaNacimiento,
      movil,
      telefFijo,
      descripcion,
      diasDisponible,
      direcFoto,
      direcFotoContacto,
      isPublic,
      ubicaciones,
      publicoDisponible,
      precioPorPublico,
    } = props;

    const auxResetDiasDisponible = [
      {
        dia: 0,
        horaInicio: "00:00",
        horaFin: "00:00",
      },
    ];

    const auxResetPublicoDisponible = {
      nino: false,
      terceraEdad: false,
      necesidadEspecial: false,
    };

    const auxResetPrecioPorPublico = {
      nino: "",
      terceraEdad: "",
      necesidadEspecial: "",
    };

    this.state = {
      isEditing: false,
      isLoading: false,
      txtNombre: isProfileView ? nombre : "",
      txtApellido1: isProfileView ? apellido1 : "",
      txtApellido2: isProfileView ? apellido2 : "",
      txtSexo: isProfileView ? sexo : "",
      txtFechaNacimiento: isProfileView ? fechaNacimiento : "",
      txtMovil: isProfileView ? movil : "",
      txtTelefFijo: isProfileView ? telefFijo : "",
      txtDescripcion: isProfileView ? descripcion : "",
      diasDisponible: isProfileView
        ? diasDisponible || auxResetDiasDisponible
        : auxResetDiasDisponible,
      publicoDisponible: isProfileView
        ? publicoDisponible || auxResetPublicoDisponible
        : auxResetPublicoDisponible,
      precioPorPublico: isProfileView
        ? precioPorPublico || auxResetPrecioPorPublico
        : auxResetPrecioPorPublico,
      ubicaciones: isProfileView ? ubicaciones : [],
      isPublic: isProfileView ? isPublic : true,
      avatarSrc: "",
      avatarPreview: "",
      imgContact: "",
      hoverSexoM: false,
      hoverSexoF: false,
      isLoading: false,
      auxAddPueblo: "",
      hoverNino: false,
      hoverTerceraEdad: false,
      hoverNecesidadEspecial: false,
      suggestionsPueblos: [],
      error: {
        txtNombre: false,
        txtEmail: false,
        txtSexo: false,
        txtFechaNacimiento: false,
        txtContrasena: false,
        txtMovil: false,
        ubicaciones: false,
        txtDescripcion: false,
        imgContact: false,
      },
    };
  }

  handleTextInputChange = (e) => {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    const stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtTelefono") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value,
    });
  };

  onClose = () => {
    this.setState({ avatarPreview: "", avatarSrc: "" });
  };

  onCrop = (preview) => {
    this.setState({ avatarPreview: preview });
  };

  onBeforeFileLoad = (elem) => {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(
        <h5>{trans("registerFormCuidadores.errorImgGrande")}</h5>
      );
      elem.target.value = "";
    }
  };

  onChangeContactImg = (picture) => {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture,
    });
  };

  render() {
    const {
      avatarSrc,
      isEditing,
      error,
      txtNombre,
      txtApellido1,
      txtApellido2,
    } = this.state;
    const { direcFoto, isProfileView } = this.props;
    return (
      <SocketContext.Consumer>
        {(socket) => (
          <div className="p-5 d-flex flex-column">
            {/* Primera fila */}
            <div className="row">
              {/* La columna del avatar y la imagen de contacto */}
              <div className="col-lg-3 col-12 d-flex flex-column">
                <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                  <span>{trans("registerFormCuidadores.avatar")}</span>
                </div>
                <div className="d-flex justify-content-center">
                  {isProfileView && !isEditing && direcFoto.length > 0 ? (
                    <img
                      height={200}
                      width={200}
                      src={
                        "http://" + ipMaquina + ":3001/api/image/" + direcFoto
                      }
                    />
                  ) : (
                    <Avatar
                      label={i18next.t("registerFormCuidadores.eligeAvatar")}
                      labelStyle={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "100%",
                        height: "100%",
                      }}
                      height={200}
                      width={200}
                      onCrop={this.onCrop}
                      onClose={this.onClose}
                      onBeforeFileLoad={this.onBeforeFileLoad}
                      src={avatarSrc}
                    />
                  )}
                </div>
              </div>
              <div
                className={
                  error.imgContact
                    ? "col-lg-3 col-12 d-flex flex-column border border-danger rounded"
                    : "col-lg-3 col-12 d-flex flex-column"
                }
              >
                <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2 mt-lg-0 mt-2">
                  <FontAwesomeIcon icon={faPortrait} className="mr-1" />
                  <span>{trans("registerFormCuidadores.fotoContacto")}</span>
                </div>
                <div className="d-flex justify-content-center">
                  <ContactImageUploader
                    onImageChoose={this.onChangeContactImg}
                  />
                </div>
              </div>
              {/* Fin columna avatar e imagen contacto */}

              {/* Inicio columna nombre y apellidos */}
              <div className="col-lg-6 col-12 d-flex flex-column justify-content-around">
                <div>
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  <span htmlFor="txtNombre">
                    {trans("registerFormCuidadores.nombre")}
                  </span>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <input
                    onChange={this.handleTextInputChange}
                    type="text"
                    class={
                      error.txtNombre
                        ? "border border-danger form-control"
                        : "form-control"
                    }
                    id="txtNombre"
                    aria-describedby="txtNombreHelp"
                    placeholder={i18next.t(
                      "registerFormCuidadores.insertNombre"
                    )}
                    value={txtNombre}
                  />
                </div>

                <div className="row">
                  <div className="col-lg-6 col-12 mt-3">
                    <label htmlFor="txtApellido1">
                      {trans("registerFormCuidadores.apellido1")}
                    </label>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido1"
                      aria-describedby="txtNombreHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.apellido1"
                      )}...`}
                      value={txtApellido1}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mt-3">
                    <label htmlFor="txtApellido2">
                      {trans("registerFormCuidadores.apellido2")}
                    </label>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido2"
                      aria-describedby="txtNombreHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.apellido2"
                      )}...`}
                      value={txtApellido2}
                    />
                  </div>
                </div>
                {/* Fin columna nombres y apellidos */}
              </div>
            </div>
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = (state) => ({
  _id: state.user._id,
  _idUsuario: state.user._idUsuario,
  nombre: state.user.nombre,
  apellido1: state.user.apellido1,
  apellido2: state.user.apellido2,
  sexo: state.user.sexo,
  fechaNacimiento: state.user.fechaNacimiento,
  direcFoto: state.user.direcFoto,
  direcFotoContacto: state.user.direcFotoContacto,
  movil: state.user.telefonoMovil,
  telefFijo: state.user.telefonoFijo,
  descripcion: state.user.descripcion,
  isPublic: state.user.isPublic,
  diasDisponible:
    typeof state.user.diasDisponible.slice != "undefined"
      ? state.user.diasDisponible.slice(0)
      : [],
  ubicaciones:
    typeof state.user.ubicaciones.slice != "undefined"
      ? state.user.ubicaciones.slice(0)
      : [],
  publicoDisponible: Object.assign({}, state.user.publicoDisponible),
  precioPorPublico: Object.assign({}, state.user.precioPorPublico),
  email: state.user.email,
  contrasena: state.user.contrasena,
});

const mapDispatchToProps = (dispatch) => ({
  saveUserSession: (user) => dispatch(saveUserSession(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormCuidador);
