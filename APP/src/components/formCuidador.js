import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cogoToast from "cogo-toast";
import { ReactDatez as Calendario } from "react-datez";
import Avatar from "react-avatar-edit";
import ClipLoader from "react-spinners/ClipLoader";
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
  faEdit,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import i18next from "i18next";
import { saveUserSession } from "../redux/actions/user";
import SocketContext from "../socketio/socket-context";
import ipMaquina from "../util/ipMaquinaAPI";
import { trans, isValidEmail } from "../util/funciones";
import ContactImageUploader from "../components/contactImageUploader";
import TimeInput from "../components/customTimeInput";

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
      email,
      contrasena,
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
      txtEmail: isProfileView ? email : "",
      txtContrasena: isProfileView ? contrasena : "",
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
    if (stateId == "txtMovil" || stateId == "txtTelefFijo") {
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

  handleCalendarChange = (valor) => {
    this.setState({
      txtFechaNacimiento: valor,
    });
  };

  handleSexChange = (sex) => {
    this.setState({
      txtSexo: sex,
    });
  };

  handleSexHover = (sex) => {
    this.setState({ [sex]: true });
  };

  handleSexLeave = (sex) => {
    this.setState({ [sex]: false });
  };

  handleEdit = () => {
    this.setState({
      isEditing: true,
    });
  };

  handleGuardarCambios = async () => {
    // TODO handle guardar cambios
  };

  removeDiasDisponible = () => {
    const { isEditing } = this.state;
    const { isProfileView } = this.props;
    if (isProfileView && !isEditing)
      return;
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
    });
  }

  addDiasDisponible = () => {
    const { isEditing } = this.state;
    const { isProfileView } = this.props;
    if (isProfileView && !isEditing){
      return;
    }
    let auxDiasDisponible = this.state.diasDisponible;
    auxDiasDisponible.push({
      dia: 0,
      horaInicio: "00:00",
      horaFin: "00:00"
    });

    this.setState({
      diasDisponible: auxDiasDisponible
    });
  }

  handleDiasDisponibleChange = (e, indice) => {
    if (typeof indice == "undefined") {
      //Significa que lo que se ha cambiado es el combo de los dias
      var origen = e.target;
      var indice = parseInt(origen.id.substr(origen.id.length - 1));
      var valor = origen.value;

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice]["dia"] = valor;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    } else {
      //Significa que ha cambiado la hora, no se sabe si inicio o fin, eso esta en "indice"
      let atributo = indice.substr(0, indice.length - 1);
      indice = indice.substr(indice.length - 1);

      let auxDiasDisponible = this.state.diasDisponible;
      auxDiasDisponible[indice][atributo] = e;

      this.setState({
        diasDisponible: auxDiasDisponible
      });
    }
  }

  render() {
    const {
      avatarSrc,
      isEditing,
      error,
      txtNombre,
      txtApellido1,
      txtApellido2,
      txtFechaNacimiento,
      txtDescripcion,
      txtMovil,
      txtSexo,
      txtTelefFijo,
      hoverSexoM,
      hoverSexoF,
      txtEmail,
      txtContrasena,
      diasDisponible
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
                  {isProfileView && !isEditing ? (
                    <div
                      style={{
                        //backgroundImage:"url(http://" + ipMaquina + ":3001/api/image/" + cuidador.direcFotoContacto + ")",
                        // height: "300px",
                        backgroundSize: "cover",
                        backgroundPosition: "top",
                        backgroundRepeat: "no-repeat",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        style={{ maxHeight: "250px", height: "auto" }}
                        src={
                          "http://" +
                          ipMaquina +
                          ":3001/api/image/" +
                          this.props.direcFotoContacto
                        }
                      />
                    </div>
                  ) : (
                    <ContactImageUploader
                      onImageChoose={this.onChangeContactImg}
                    />
                  )}
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
                    disabled={!isProfileView || isEditing ? null : "disabled"}
                    aria-describedby="txtNombreHelp"
                    placeholder={i18next.t(
                      "registerFormCuidadores.insertNombre"
                    )}
                    value={txtNombre}
                  />
                </div>

                <div className="row">
                  <div className="col-lg-6 col-12 mt-3">
                    <span htmlFor="txtApellido1">
                      {trans("registerFormCuidadores.apellido1")}
                    </span>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido1"
                      disabled={!isProfileView || isEditing ? null : "disabled"}
                      aria-describedby="txtNombreHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.apellido1"
                      )}...`}
                      value={txtApellido1}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mt-3">
                    <span htmlFor="txtApellido2">
                      {trans("registerFormCuidadores.apellido2")}
                    </span>
                    <input
                      onChange={this.handleTextInputChange}
                      type="text"
                      class="form-control"
                      id="txtApellido2"
                      disabled={!isProfileView || isEditing ? null : "disabled"}
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
            {/* Segunda fila */}
            <div className="row">
              <div className="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                <span htmlFor="txtFechaNacimiento">
                  {trans("registerFormCuidadores.fechaNac")}
                </span>{" "}
                (<span className="text-danger font-weight-bold">*</span>)
                <br />
                <Calendario
                  dateFormat="YYYY/MM/DD"
                  inputClassName="form-control"
                  inputStyle={{ width: "100%" }}
                  displayCalendars={!isProfileView || isEditing ? 1 : 0}
                  className={
                    error.txtFechaNacimiento
                      ? "border border-danger w-100"
                      : "w-100"
                  }
                  allowPast={true}
                  allowFuture={false}
                  id="txtFechaNacimiento"
                  handleChange={this.handleCalendarChange}
                  disableInputIcon={isProfileView && !isEditing}
                  value={txtFechaNacimiento}
                />
              </div>
              <div className="d-lg-none d-inline col-12 mt-3">
                <FontAwesomeIcon icon={faVenusMars} className="mr-1" />
                <span>{trans("registerFormCuidadores.sexo")}</span> (
                <span className="text-danger">*</span>)
              </div>
              <div
                className={
                  error.txtSexo
                    ? "col-lg-3 col-6 text-center p-1 border border-danger mt-3"
                    : "col-lg-3 col-6 text-center p-1 mt-3"
                }
                onClick={() =>
                  !isProfileView || isEditing ? this.handleSexChange("M") : null
                }
                onMouseEnter={() =>
                  !isProfileView || isEditing
                    ? this.handleSexHover("hoverSexoM")
                    : null
                }
                onMouseLeave={() =>
                  !isProfileView || isEditing
                    ? this.handleSexLeave("hoverSexoM")
                    : null
                }
                id="txtSexM"
                style={{
                  borderRadius: "8px",
                  cursor: !isProfileView || isEditing ? "pointer" : "no-drop",
                  boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                  background:
                    txtSexo == "M" ? "#28a745" : hoverSexoM ? "#545b62" : "",
                  color: txtSexo == "M" || hoverSexoM ? "white" : "black",
                }}
              >
                <FontAwesomeIcon className="fa-5x" icon={faMale} />
              </div>
              <div
                className={
                  error.txtSexo
                    ? "col-lg-3 col-6 text-center p-1 border border-danger mt-3"
                    : "col-lg-3 col-6 text-center p-1 mt-3"
                }
                id="txtSexF"
                onClick={() =>
                  !isProfileView || isEditing ? this.handleSexChange("F") : null
                }
                onMouseEnter={() =>
                  !isProfileView || isEditing
                    ? this.handleSexHover("hoverSexoF")
                    : null
                }
                onMouseLeave={() =>
                  !isProfileView || isEditing
                    ? this.handleSexLeave("hoverSexoF")
                    : null
                }
                style={{
                  borderRadius: "8px",
                  cursor: !isProfileView || isEditing ? "pointer" : "no-drop",
                  boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                  background:
                    txtSexo == "F" ? "#28a745" : hoverSexoF ? "#545b62" : "",
                  color: txtSexo == "F" || hoverSexoF ? "white" : "black",
                }}
              >
                <FontAwesomeIcon className="fa-5x" icon={faFemale} />
              </div>
            </div>
            {/* Tercera fila */}
            <div className="row">
              {!isProfileView ? (
                <>
                  <div className="col-lg-6 col-12 mt-3">
                    <FontAwesomeIcon icon={faAt} className="mr-1" />
                    <span htmlFor="txtEmail">
                      {trans("registerFormCuidadores.email")}
                    </span>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                    <input
                      onChange={this.handleTextInputChange}
                      type="email"
                      class={
                        error.txtEmail
                          ? "border border-danger form-control"
                          : "form-control"
                      }
                      id="txtEmail"
                      aria-describedby="emailHelp"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.email"
                      )}...`}
                      value={txtEmail}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mt-3">
                    <FontAwesomeIcon icon={faKey} className="mr-1 mt-3" />
                    <span className="pt-2" htmlFor="txtContrasena">
                      {trans("registerFormCuidadores.contrasena")}
                    </span>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                    <input
                      onChange={this.handleTextInputChange}
                      type="password"
                      class={
                        error.txtContrasena
                          ? "border border-danger form-control"
                          : "form-control"
                      }
                      id="txtContrasena"
                      placeholder={`${i18next.t(
                        "registerFormCuidadores.contrasena"
                      )}...`}
                      value={txtContrasena}
                    />
                  </div>
                </>
              ) : null}
            </div>
            <div className="row">
              <div class="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faMobileAlt} className="mr-1" />
                <span htmlFor="txtMovil">
                  {trans("registerFormCuidadores.movil")}
                </span>{" "}
                (<span className="text-danger font-weight-bold">*</span>)
                <input
                  onChange={this.handleTextInputChange}
                  type="number"
                  class={
                    error.txtMovil
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  disabled={!isProfileView || isEditing ? null : "disabled"}
                  id="txtMovil"
                  aria-describedby="emailHelp"
                  placeholder={`${i18next.t(
                    "registerFormCuidadores.movil"
                  )}...`}
                  value={txtMovil}
                />
              </div>
              <div className="col-lg-6 col-12 mt-3">
                <FontAwesomeIcon icon={faPhoneSquareAlt} className="mr-1 mt-3" />
                <span className="" htmlFor="txtTelefono">
                  {trans("registerFormCuidadores.telefFijo")}
                </span>
                <input
                  onChange={this.handleTextInputChange}
                  type="number"
                  class="form-control"
                  disabled={!isProfileView || isEditing ? null : "disabled"}
                  id="txtTelefFijo"
                  placeholder={`${i18next.t('registerFormCuidadores.telefFijo')}...`}
                  value={txtTelefFijo}
                />
              </div>
            </div>
            {/* Fin tercera fila */}
            {/* Inicio cuarta fila */}
            <div className="d-flex flex-column col-lg-6 col-12 mt-3">
              <span className="d-flex flex-row justify-content-between align-items-center">
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={this.removeDiasDisponible}
                  className={!isProfileView || (isEditing && diasDisponible.length > 0) ? "text-danger" : "text-secondary"}
                  icon={faMinusCircle}
                />
                <div>
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span className="lead">
                    {trans("registerFormCuidadores.diasDisponible")}:
                  </span>
                </div>
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  onClick={this.addDiasDisponible}
                  className={!isProfileView || isEditing ? "text-success" : "text-secondary"}
                  icon={faPlusCircle}
                />                    
              </span>
              <div className={ error.diasDisponible ? "w-100 mt-2 border border-danger" : "w-100 mt-2"} id="diasDisponible">
                {/* Aqui iran los dias dinamicamente */}
                {this.state.diasDisponible.map((dia, indice) => {
                  return (
                    <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                      <select
                        value={dia.dia}
                        onChange={this.handleDiasDisponibleChange}
                        disabled={isProfileView && !isEditing}
                        className="d-inline"
                        id={"dia" + indice}
                      >
                        <option>{i18next.t('registerFormCuidadores.elegirDia')}</option>
                        <option value="1">{i18next.t('registerFormCuidadores.lunes')}</option>
                        <option value="2">{i18next.t('registerFormCuidadores.martes')}</option>
                        <option value="3">{i18next.t('registerFormCuidadores.miercoles')}</option>
                        <option value="4">{i18next.t('registerFormCuidadores.jueves')}</option>
                        <option value="5">{i18next.t('registerFormCuidadores.viernes')}</option>
                        <option value="6">{i18next.t('registerFormCuidadores.sabado')}</option>
                        <option value="7">{i18next.t('registerFormCuidadores.domingo')}</option>
                      </select>
                      <div className="d-flex flex-row align-items-center">
                        <TimeInput
                          disabled={isProfileView && !isEditing}
                          onTimeChange={(valor) => {
                            this.handleDiasDisponibleChange(
                              valor,
                              "horaInicio" + indice
                            );
                          }}
                          id={"horaInicio" + indice}
                          initTime={
                            diasDisponible[indice].horaInicio
                          }
                          style={{
                            width: 50,
                          }}
                          className="text-center"
                        />
                        -
                        <TimeInput
                          disabled={isProfileView && !isEditing}
                          onTimeChange={(valor) => {
                            this.handleDiasDisponibleChange(
                              valor,
                              "horaFin" + indice
                            );
                          }}
                          id={"horaFin" + indice}
                          initTime={diasDisponible[indice].horaFin}
                          style={{
                            width: 50,
                          }}
                          className="text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>                
            </div>
            <div id="loaderOrButton" className="row mt-5">
              <div className="col-12">
                {!this.state.isEditing ? (
                  <button
                    onClick={() => this.handleEdit()}
                    type="button"
                    className="w-100 btn btn-info "
                  >
                    {trans("perfilCliente.editar")}
                    <FontAwesomeIcon className="ml-1" icon={faEdit} />
                  </button>
                ) : this.state.isLoading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <ClipLoader color="#28a745" />
                  </div>
                ) : (
                  <button
                    onClick={() => this.handleGuardarCambios()}
                    type="button"
                    className="w-100 btn btn-success"
                  >
                    {trans("perfilCliente.guardarCambios")}
                    <FontAwesomeIcon className="ml-1" icon={faSave} />
                  </button>
                )}
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
