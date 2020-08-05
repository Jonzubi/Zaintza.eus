import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faPortrait
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ipMaquina from "../../util/ipMaquinaAPI";
import Avatar, { Avatar as AvatarUpload } from "react-avatar-edit";
import ContactImageUploader from "../../components/contactImageUploader";
import cogoToast from "cogo-toast";
import { ReactDatez as Calendario } from "react-datez";
import Switch from "react-switch";
import TimeInput from "../../components/customTimeInput";
import PuebloAutosuggest from "../../components/pueblosAutosuggest";
import "react-datez/dist/css/react-datez.css";
import imgNino from "../../util/images/nino.png";
import imgNecesidadEspecial from "../../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../../util/images/terceraEdad.png";
import { getRandomString, toBase64 } from "../../util/funciones";
import { connect } from "react-redux";
import { changeFormContent } from "../../redux/actions/app";
import { saveUserSession } from "../../redux/actions/user";
import municipios from "../../util/municipos";
import { trans, isValidEmail } from "../../util/funciones";
import SocketContext from "../../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import "./registerFormCuidador.css";
import i18next from "i18next";

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form)),
    saveUserSession: user => dispatch(saveUserSession(user))
  };
};

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.requiredStates = [
      "txtNombre",
      "txtEmail",
      "txtSexo",
      "txtFechaNacimiento",
      "txtContrasena",
      "txtMovil",
      "ubicaciones",
      "txtDescripcion",
      "imgContact"
    ];
    //El array de abajo es para traducir el error
    this.requiredStatesTraduc = {
      txtNombre: "registerFormCuidadores.nombre",
      txtSexo: "registerFormCuidadores.sexo",
      txtEmail: "registerFormCuidadores.email",
      txtFechaNacimiento: "registerFormCuidadores.fechaNac",
      txtContrasena: "registerFormCuidadores.contrasena",
      txtMovil: "registerFormCuidadores.movil",
      ubicaciones: "registerFormCuidadores.pueblosDisponible",
      txtDescripcion: "registerFormCuidadores.descripcion",
      imgContact: "registerFormCuidadores.imgContact"
    };
    this.state = {
      txtNombre: "",
      txtApellido1: "",
      txtApellido2: "",
      txtEmail: "",
      txtSexo: "",
      txtFechaNacimiento: "",
      txtContrasena: "",
      txtMovil: "",
      txtTelefono: "",
      diasDisponible: [
        {
          dia: 0,
          horaInicio: "00:00",
          horaFin: "00:00"
        }
      ],
      publicoDisponible: {
        nino: false,
        terceraEdad: false,
        necesidadEspecial: false
      },
      precioPorPublico: {
        nino: "",
        terceraEdad: "",
        necesidadEspecial: ""
      },
      ubicaciones: [],
      txtDescripcion: "",
      isPublic: true,
      avatarSrc: "",
      avatarPreview: "",
      imgContact: null,
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
        imgContact: false
      }
    };

    this.onCrop = this.onCrop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegistrarse = this.handleRegistrarse.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(
      this
    );
    this.handleAuxAddPuebloChange = this.handleAuxAddPuebloChange.bind(this);
    this.handleAddPueblo = this.handleAddPueblo.bind(this);
    this.handleRemovePueblo = this.handleRemovePueblo.bind(this);
    this.handlePublicoHover = this.handlePublicoHover.bind(this);
    this.handlePublicoLeave = this.handlePublicoLeave.bind(this);
    this.handlePublicoChange = this.handlePublicoChange.bind(this);
    this.handlePrecioChange = this.handlePrecioChange.bind(this);
    this.onChangeContactImg = this.onChangeContactImg.bind(this);
  }

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return [];
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return municipios.filter(pueblo => regex.test(pueblo));
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return <span>{suggestion}</span>;
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestionsPueblos: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestionsPueblos: []
    });
  };

  onClose() {
    this.setState({ avatarPreview: "", avatarSrc: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(
        <h5>{trans("registerFormCuidadores.errorImgGrande")}</h5>
      );
      elem.target.value = "";
    }
  }

  onChangeContactImg(picture) {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture
    });
  }

  handleCalendarChange(valor) {
    this.setState({
      txtFechaNacimiento: valor
    });
  }

  handleIsPublicChange(valor) {
    this.setState({
      isPublic: valor
    });
  }

  handleAuxAddPuebloChange(e, { newValue }) {
    this.setState({
      auxAddPueblo: newValue
    });
  }

  handleAddPueblo(c, { suggestion }) {
    this.setState(
      {
        auxAddPueblo: suggestion
      },
      () => {
        let pueblo = this.state.auxAddPueblo;
        if (pueblo == "") return;

        if (!municipios.includes(pueblo)) {
          cogoToast.error(
            <h5>
              {pueblo} {trans("registerFormCuidadores.errorPuebloNoExiste")}
            </h5>
          );
          return;
        }

        for (var clave in this.state.ubicaciones) {
          if (this.state.ubicaciones[clave] == pueblo) {
            cogoToast.error(
              <h5>
                {pueblo} {trans("registerFormCuidadores.errorPuebloRepetido")}
              </h5>
            );
            return;
          }
        }
        this.state.ubicaciones.push(pueblo);
        this.setState({
          ubicaciones: this.state.ubicaciones,
          auxAddPueblo: ""
        });
      }
    );
  }

  handleRemovePueblo() {
    this.setState({
      ubicaciones:
        typeof this.state.ubicaciones.pop() != "undefined"
          ? this.state.ubicaciones
          : []
    });
  }

  addDiasDisponible() {
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

  handleDiasDisponibleChange(e, indice) {
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

  removeDiasDisponible() {
    this.setState({
      diasDisponible:
        typeof this.state.diasDisponible.pop() != "undefined"
          ? this.state.diasDisponible
          : []
    });
  }

  handleInputChange(e) {
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtTelefono") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleSexChange(sex) {
    this.setState({
      txtSexo: sex
    });
  }

  handleSexHover(sex) {
    this.setState({ [sex]: true });
  }

  handleSexLeave(sex) {
    this.setState({ [sex]: false });
  }

  handlePublicoHover(publico) {
    this.setState({
      [publico]: true
    });
  }

  handlePublicoLeave(publico) {
    this.setState({
      [publico]: false
    });
  }

  handlePublicoChange(publico) {
    let auxPublicoDisponible = this.state.publicoDisponible;
    auxPublicoDisponible[publico] = !auxPublicoDisponible[publico];
    this.setState({
      publicoDisponible: auxPublicoDisponible
    });
  }

  handlePrecioChange(atributo, valor) {
    let auxPrecioPublico = this.state.precioPorPublico;
    auxPrecioPublico[atributo] = valor;
    this.setState({
      precioPorPublico: auxPrecioPublico
    });
  }

  async handleRegistrarse(socket) {
    for (var clave in this.state) {
      if (this.state[clave] === null) continue;
      if (
        this.state[clave].length == 0 &&
        this.requiredStates.includes(clave)
      ) {
        cogoToast.error(
          <h5>
            {trans("registerFormCuidadores.errorRellenaTodo")} (
            {trans(this.requiredStatesTraduc[clave])})
          </h5>
        );
        let auxError = this.state.error;
        auxError[clave] = true;
        this.setState({
          error: auxError
        });
        return;
      }
      //Hago una comporbacion diferente para los dias, para que haya elegido un dia en el combo
      if (clave == "diasDisponible") {
        let error = false;
        this.state[clave].map(confDia => {
          if (confDia.dia == 0 || isNaN(confDia.dia)) {
            cogoToast.error(
              <h5>{trans("registerFormCuidadores.errorDiaNoElegido")}</h5>
            );
            error = true;
            return;
          }
        });
        if (error) return;
      }
    }

    // Comprobamos que el email sea valido sintacticamente
    const { txtEmail } = this.state;
    if(!isValidEmail(txtEmail)){
      cogoToast.error(
        <h5>
          {trans('commonErrors.invalidEmail')}
        </h5>
      );
      return;
    }

    const checkIfEmailExists = await axios.get(
      `http://${ipMaquina}:3001/api/procedures/checkIfEmailExists/${this.state.txtEmail}`
    );

    if (checkIfEmailExists.data !== "Vacio") {
      cogoToast.error(<h5>{trans("registerFormCuidadores.emailExistente")}</h5>);
      return;
    }

    if (this.state.imgContact === null){
      cogoToast.error(<h5>{trans("registerFormCuidadores.errorRellenaTodo")} (
        {trans('registerFormCuidadores.imgContact')})</h5>);      
      return;
    }

    this.setState({ isLoading: true });

    var imgContactB64 = await toBase64(this.state.imgContact[0]);

    if (imgContactB64 instanceof Error) {
      cogoToast.error(<h5>{trans("registerFormCuidadores.errorImagen")}</h5>);
      return;
    }

    const validationToken = getRandomString(30);

    const formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      sexo: this.state.txtSexo,
      avatarPreview: this.state.avatarPreview,
      imgContactB64: imgContactB64,
      descripcion: this.state.txtDescripcion,
      telefonoMovil: this.state.txtMovil,
      telefonoFijo: this.state.txtTelefono,
      isPublic: this.state.isPublic,
      diasDisponible: this.state.diasDisponible,
      fechaNacimiento: this.state.txtFechaNacimiento,
      ubicaciones: this.state.ubicaciones,
      publicoDisponible: this.state.publicoDisponible,
      precioPorPublico: this.state.precioPorPublico,
      email: this.state.txtEmail,
      contrasena: this.state.txtContrasena,
      tipoUsuario: "Cuidador",
      validationToken
    };

    const insertedCuidador = await axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/postNewCuidador",
        formData
      )
      .catch(err => {
        this.setState({
          isLoading: false
        });
        cogoToast.error(
          <h5>{trans("registerFormCuidadores.errorGeneral")}</h5>
        );
        return;
      });

      if (insertedCuidador === undefined) {
        //Si entra aqui el servidor a tenido un error
        //Por ahora ese error seria un duplicado de email
        return;
      }

    axios.post(`http://${ipMaquina}:3003/smtp/registerEmail`, {
      toEmail: this.state.txtEmail,
      nombre: this.state.txtNombre,
      apellido: this.state.txtApellido1,
      validationToken
    });

    cogoToast.success(
      <div>
        <h5>{trans("registerFormCuidadores.registroCompletado")}</h5>
        <small>
          <b>{trans("registerFormCuidadores.darGracias")}</b>
        </small>
      </div>
    );
    this.props.changeFormContent("tabla");
  }

  render() {
    const { diasDisponible } = this.state;
    return (
      <SocketContext.Consumer>
        {socket => (
          <div className="p-5 d-flex flex-column">
              <div className="row">
                <div className="col-lg-3 col-12 d-flex flex-column">
                  <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                    <span>
                      {trans("registerFormCuidadores.avatar")}
                    </span>
                  </div>
                  <div className="d-flex justify-content-center">
                    <Avatar
                      label="Aukeratu avatarra"
                      labelStyle={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "100%",
                        height: "100%"
                      }}
                      height={200}
                      width={200}
                      onCrop={this.onCrop}
                      onClose={this.onClose}
                      onBeforeFileLoad={this.onBeforeFileLoad}
                      src={this.state.avatarSrc}
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-12 d-flex flex-column">
                  <div className="d-flex justify-content-lg-start justify-content-center align-items-center mb-lg-0 mb-2 mt-lg-0 mt-2">
                    <FontAwesomeIcon icon={faPortrait} className="mr-1" />
                    <span>
                      {trans("registerFormCuidadores.fotoContacto")}
                    </span>
                  </div>
                  <div className="d-flex justify-content-center">
                    <ContactImageUploader
                      onImageChoose={this.onChangeContactImg}
                    />
                  </div>                  
                </div>

                <div className="col-lg-6 col-12">
                  <div class="">
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    <label htmlFor="txtNombre">
                      {trans("registerFormCuidadores.nombre")}
                    </label>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                    <input
                      onChange={this.handleInputChange}
                      type="text"
                      class={
                        this.state.error.txtNombre
                          ? "border border-danger form-control"
                          : "form-control"
                      }
                      id="txtNombre"
                      aria-describedby="txtNombreHelp"
                      placeholder={i18next.t('registerFormCuidadores.insertNombre')}
                      value={this.state.txtNombre}
                    />
                  </div>
                  <div class="row">
                    <div className="col-lg-6 col-12 mt-3">
                      <label htmlFor="txtApellido1">
                        {trans("registerFormCuidadores.apellido1")}
                      </label>
                      <input
                        onChange={this.handleInputChange}
                        type="text"
                        class="form-control"
                        id="txtApellido1"
                        aria-describedby="txtNombreHelp"
                        placeholder={`${i18next.t('registerFormCuidadores.apellido1')}...`}
                        value={this.state.txtApellido1}
                      />
                    </div>
                    <div className="col-lg-6 col-12 mt-3">
                      <label htmlFor="txtApellido2">
                        {trans("registerFormCuidadores.apellido2")}
                      </label>
                      <input
                        onChange={this.handleInputChange}
                        type="text"
                        class="form-control"
                        id="txtApellido2"
                        aria-describedby="txtNombreHelp"
                        placeholder={`${i18next.t('registerFormCuidadores.apellido2')}...`}
                        value={this.state.txtApellido2}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div className="col-lg-6 col-12 mt-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  <label htmlFor="txtFechaNacimiento">
                    {trans("registerFormCuidadores.fechaNac")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <br />
                  <Calendario
                    dateFormat="YYYY/MM/DD"
                    inputClassName="form-control"
                    inputStyle={{ width: "100%" }}
                    className={
                      this.state.error.txtNombre
                        ? "border border-danger w-100"
                        : "w-100"
                    }
                    allowPast={true}
                    allowFuture={false}
                    id="txtFechaNacimiento"
                    handleChange={this.handleCalendarChange}
                    value={this.state.txtFechaNacimiento}
                  />
                </div>
                <div className="d-lg-none d-inline col-12 mt-3">
                  <FontAwesomeIcon icon={faVenusMars} className="mr-1" />
                  <span>{trans('registerFormCuidadores.sexo')}</span>
                  {" "}
                  (<span className="text-danger">*</span>)
                </div>
                <div
                  className={
                    this.state.error.txtNombre
                      ? "col-lg-3 col-6 text-center p-1 border border-danger mt-lg-0 mt-3"
                      : "col-lg-3 col-6 text-center p-1 mt-lg-0 mt-3"
                  }
                  onClick={() => this.handleSexChange("M")}
                  onMouseEnter={() => this.handleSexHover("hoverSexoM")}
                  onMouseLeave={() => this.handleSexLeave("hoverSexoM")}
                  id="txtSexM"
                  style={{
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                    background:
                      this.state.txtSexo == "M"
                        ? "#28a745"
                        : this.state.hoverSexoM
                        ? "#545b62"
                        : "",
                    color:
                      this.state.txtSexo == "M" || this.state.hoverSexoM
                        ? "white"
                        : "black"
                  }}
                >
                  <FontAwesomeIcon className="fa-5x" icon={faMale} />
                </div>
                <div
                  className={
                    this.state.error.txtNombre
                      ? "col-lg-3 col-6 text-center p-1 border border-danger mt-lg-0 mt-3"
                      : "col-lg-3 col-6 text-center p-1 mt-lg-0 mt-3"
                  }
                  id="txtSexF"
                  onClick={() => this.handleSexChange("F")}
                  onMouseEnter={() => this.handleSexHover("hoverSexoF")}
                  onMouseLeave={() => this.handleSexLeave("hoverSexoF")}
                  style={{
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,.075)",
                    background:
                      this.state.txtSexo == "F"
                        ? "#28a745"
                        : this.state.hoverSexoF
                        ? "#545b62"
                        : "",
                    color:
                      this.state.txtSexo == "F" || this.state.hoverSexoF
                        ? "white"
                        : "black"
                  }}
                >
                  <FontAwesomeIcon className="fa-5x" icon={faFemale} />
                </div>
              </div>

              <div className="row">
                <div class="col-lg-6 col-12 mt-3">
                  <FontAwesomeIcon icon={faAt} className="mr-1"  />
                  <label htmlFor="txtEmail">
                    {trans("registerFormCuidadores.email")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <input
                    onChange={this.handleInputChange}
                    type="email"
                    class={
                      this.state.error.txtNombre
                        ? "border border-danger form-control"
                        : "form-control"
                    }
                    id="txtEmail"
                    aria-describedby="emailHelp"
                    placeholder={`${i18next.t('registerFormCuidadores.email')}...`}
                    value={this.state.txtEmail}
                  />
                  <FontAwesomeIcon icon={faKey} className="mr-1 mt-3" />
                  <label className="pt-2" htmlFor="txtContrasena">
                    {trans("registerFormCuidadores.contrasena")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <input
                    onChange={this.handleInputChange}
                    type="password"
                    class={
                      this.state.error.txtNombre
                        ? "border border-danger form-control"
                        : "form-control"
                    }
                    id="txtContrasena"
                    placeholder={`${i18next.t('registerFormCuidadores.contrasena')}...`}
                    value={this.state.txtContrasena}
                  />
                </div>
                <div class="col">
                  <FontAwesomeIcon icon={faMobileAlt} className="mr-1 mt-3" />
                  <label htmlFor="txtMovil">
                    {trans("registerFormCuidadores.movil")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                  <input
                    onChange={this.handleInputChange}
                    type="number"
                    class={
                      this.state.error.txtNombre
                        ? "border border-danger form-control"
                        : "form-control"
                    }
                    id="txtMovil"
                    aria-describedby="emailHelp"
                    placeholder={`${i18next.t('registerFormCuidadores.movil')}...`}
                    value={this.state.txtMovil}
                  />
                  <FontAwesomeIcon icon={faPhoneSquareAlt} className="mr-1 mt-3" />
                  <label className="pt-2" htmlFor="txtTelefono">
                    {trans("registerFormCuidadores.telefFijo")}
                  </label>
                  <input
                    onChange={this.handleInputChange}
                    type="number"
                    class="form-control"
                    id="txtTelefono"
                    placeholder={`${i18next.t('registerFormCuidadores.telefFijo')}...`}
                    value={this.state.txtTelefono}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-12 d-flex flex-column justify-content-between mt-3">
                  {/* Insertar dias disponibles aqui */}
                  <span className="d-flex flex-row justify-content-between align-items-center">
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      onClick={this.removeDiasDisponible}
                      className="text-danger"
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
                      className="text-success"
                      icon={faPlusCircle}
                    />                    
                  </span>                  
                  <div className="w-100 mt-2" id="diasDisponible">
                    {/* Aqui iran los dias dinamicamente */}
                    {this.state.diasDisponible.map((dia, indice) => {
                      return (
                        <div className="mt-1 d-flex flex-row align-items-center justify-content-between">
                          <select
                            value={dia.dia}
                            onChange={this.handleDiasDisponibleChange}
                            className="d-inline"
                            id={"dia" + indice}
                          >
                            <option>Aukeratu eguna</option>
                            <option value="1">Astelehena</option>
                            <option value="2">Asteartea</option>
                            <option value="3">Asteazkena</option>
                            <option value="4">Osteguna</option>
                            <option value="5">Ostirala</option>
                            <option value="6">Larunbata</option>
                            <option value="7">Igandea</option>
                          </select>
                          <div className="d-flex flex-row align-items-center">
                            <TimeInput
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
                <div className="col-lg-6 col-12 mt-3">
                  {/* Insertar ubicaciones disponibles aqui */}
                  <span className="d-flex flex-row justify-content-center align-items-center">
                    <FontAwesomeIcon icon={faHome} className="mr-1" />
                    <span
                      htmlFor="txtAddPueblos"
                      className="lead"
                    >
                      {trans("registerFormCuidadores.pueblosDisponible")}
                    </span>{" "}
                    (<span className="text-danger font-weight-bold">*</span>)
                  </span>
                  
                  <div class="mt-2">
                    <PuebloAutosuggest
                      onSuggestionSelected={this.handleAddPueblo}
                    />
                    {this.state.ubicaciones.length > 0 ? (
                      <h5 className="mt-2 lead">
                        {trans("registerFormCuidadores.pueblosSeleccionados")}:
                      </h5>
                    ) : (
                      ""
                    )}

                    <ul className="list-group">
                      {this.state.ubicaciones.map(pueblo => {
                        return <li className="list-group-item">{pueblo}</li>;
                      })}
                    </ul>
                    {this.state.ubicaciones.length > 0 ? (
                      <a
                        onClick={this.handleRemovePueblo}
                        className="mt-4 btn btn-danger float-right text-light"
                      >
                        {trans("registerFormCuidadores.eliminarPueblo")}{" "}
                        <FontAwesomeIcon icon={faMinusCircle} />
                      </a>
                    ) : (
                      ""
                    )}
                  </div>
                  <br />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-12 d-flex flex-column mt-3">
                  {/* Insertar publico disponibles aqui */}
                  <span className="d-flex flex-row justify-content-center align-items-center">
                    <FontAwesomeIcon icon={faUsers} className="mr-1" />
                    <span className="lead">
                      {trans("registerFormCuidadores.publicoDisponible")}:
                    </span>
                  </span>
                  
                  <div className="row md-2">
                    <div
                      onClick={() => {
                        this.handlePublicoChange("nino");
                      }}
                      onMouseEnter={() => {
                        this.handlePublicoHover("hoverNino");
                      }}
                      onMouseLeave={() => {
                        this.handlePublicoLeave("hoverNino");
                      }}
                      className="col-4 text-center p-1"
                      style={{
                        background: this.state.publicoDisponible.nino
                          ? "#28a745"
                          : this.state.hoverNino
                          ? "#545b62"
                          : ""
                      }}
                    >
                      <img src={imgNino} className="w-100 h-100" />
                      <small className="font-weight-bold">
                        {trans("registerFormCuidadores.ninos")}
                      </small>
                    </div>
                    <div
                      onClick={() => {
                        this.handlePublicoChange("terceraEdad");
                      }}
                      onMouseEnter={() => {
                        this.handlePublicoHover("hoverTerceraEdad");
                      }}
                      onMouseLeave={() => {
                        this.handlePublicoLeave("hoverTerceraEdad");
                      }}
                      className="col-4 text-center p-1"
                      style={{
                        background: this.state.publicoDisponible.terceraEdad
                          ? "#28a745"
                          : this.state.hoverTerceraEdad
                          ? "#545b62"
                          : ""
                      }}
                    >
                      <img src={imgTerceraEdad} className="w-100 h-100" />
                      <small className="font-weight-bold">
                        {trans("registerFormCuidadores.terceraEdad")}
                      </small>
                    </div>
                    <div
                      onClick={() => {
                        this.handlePublicoChange("necesidadEspecial");
                      }}
                      onMouseEnter={() => {
                        this.handlePublicoHover("hoverNecesidadEspecial");
                      }}
                      onMouseLeave={() => {
                        this.handlePublicoLeave("hoverNecesidadEspecial");
                      }}
                      className="col-4 text-center p-1"
                      style={{
                        background: this.state.publicoDisponible
                          .necesidadEspecial
                          ? "#28a745"
                          : this.state.hoverNecesidadEspecial
                          ? "#545b62"
                          : ""
                      }}
                    >
                      <img src={imgNecesidadEspecial} className="w-100 h-100" />
                      <small className="font-weight-bold">
                        {trans("registerFormCuidadores.necesidadEspecial")}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-12 mt-lg-3 mt-5">
                  {/* Insertar precioPublico disponibles aqui */}
                  <span className="d-flex flex-row justify-content-center align-items-center">
                    <FontAwesomeIcon icon={faEuroSign} className="mr-1" />
                    <span className="lead">{trans("registerFormCuidadores.precioPorPublico")}:</span>
                  </span>
                  <div className="list-group md-2">
                    {this.state.publicoDisponible.nino ? (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>{trans("registerFormCuidadores.ninos")}</b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange("nino", event.target.value);
                          }}
                          className="form-control"
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    ) : (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>{trans("registerFormCuidadores.ninos")}</b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange("nino", event.target.value);
                          }}
                          className="form-control"
                          disabled
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    )}

                    {this.state.publicoDisponible.terceraEdad ? (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>{trans("registerFormCuidadores.terceraEdad")}</b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange(
                              "terceraEdad",
                              event.target.value
                            );
                          }}
                          className="form-control"
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    ) : (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>{trans("registerFormCuidadores.terceraEdad")}</b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange(
                              "terceraEdad",
                              event.target.value
                            );
                          }}
                          disabled
                          className="form-control"
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    )}

                    {this.state.publicoDisponible.necesidadEspecial ? (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>
                            {trans("registerFormCuidadores.necesidadEspecial")}
                          </b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange(
                              "necesidadEspecial",
                              event.target.value
                            );
                          }}
                          className="form-control"
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    ) : (
                      <div className="list-group-item text-center p-1">
                        <small>
                          <b>
                            {trans("registerFormCuidadores.necesidadEspecial")}
                          </b>
                        </small>
                        <input
                          onChange={event => {
                            this.handlePrecioChange(
                              "necesidadEspecial",
                              event.target.value
                            );
                          }}
                          disabled
                          className="form-control"
                          type="number"
                          placeholder={`${i18next.t('registerFormCuidadores.holderPrecio')}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <FontAwesomeIcon icon={faPenSquare} className="mr-1" />
                <label htmlFor="txtDescripcion">
                  {trans("registerFormCuidadores.descripcion")}
                </label>{" "}
                (<span className="text-danger font-weight-bold">*</span>)
                <textarea
                  onChange={this.handleInputChange}
                  class={
                    this.state.error.txtNombre
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  rows="5"
                  id="txtDescripcion"
                  placeholder={`${i18next.t('registerFormCuidadores.descripcion')}...`}
                  value={this.state.txtDescripcion}
                ></textarea>
              </div>

              <div className="mt-3">
                <Switch
                  onChange={this.handleIsPublicChange}
                  checked={this.state.isPublic}
                  id="isPublic"
                />
                <br />
                <small>{trans("registerFormCuidadores.publicarAuto")}</small>
              </div>

              <div id="loaderOrButton" className="w-100 mt-5 text-center">
                {this.state.isLoading ? (
                  <ClipLoader
                    color="#28a745"
                  />
                ) : (
                  <button
                    onClick={() => this.handleRegistrarse(socket)}
                    type="button"
                    className="w-100 btn btn-success "
                  >
                    {trans("registerFormCuidadores.registrarse")}
                  </button>
                )}
              </div>
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = state => ({
  nowLang: state.app.nowLang
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
