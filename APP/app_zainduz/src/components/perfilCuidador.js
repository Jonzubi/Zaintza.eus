import React from "react";
import { connect } from "react-redux";
import Avatar from "react-avatar-edit";
import ImageUploader from "react-images-upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faMale,
  faFemale,
  faMinusCircle,
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
import TimeInput from "react-time-input";
import AutoSuggest from "react-autosuggest";
import { ReactDatez as Calendario } from "react-datez";
import cogoToast from "cogo-toast";
import Switch from "react-switch";
import { trans } from "../util/funciones";
import ipMaquina from "../util/ipMaquinaAPI";
import loadGif from "../util/gifs/loadGif.gif";
import municipios from "../util/municipos";
import imgNino from "../util/images/nino.png";
import imgNecesidadEspecial from "../util/images/genteConNecesidadesEspeciales.png";
import imgTerceraEdad from "../util/images/terceraEdad.png";
import { getRandomString, toBase64 } from "../util/funciones";
import Axios from "axios";
import {saveUserSession} from "../redux/actions/user";

const mapStateToProps = state => {
  //Aqui van los especialitos de los undefined
  const movil =
    typeof state.user.telefono.movil == "undefined"
      ? undefined
      : state.user.telefono.movil.numero;
  const telefFijo =
    typeof state.user.telefono.fijo == "undefined"
      ? undefined
      : state.user.telefono.fijo.numero;

  return {
    _id: state.user._id,
    _idUsuario: state.user._idUsuario,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    apellido2: state.user.apellido2,
    sexo: state.user.sexo,
    fechaNacimiento: state.user.fechaNacimiento,
    direcFoto: state.user.direcFoto,
    direcFotoContacto: state.user.direcFotoContacto,
    movil: movil,
    telefFijo: telefFijo,
    descripcion: state.user.descripcion,
    isPublic: state.user.isPublic,
    diasDisponible: state.user.diasDisponible.slice(0),
    ubicaciones: state.user.ubicaciones.slice(0),
    publicoDisponible: Object.assign({}, state.user.publicoDisponible),
    precioPorPublico: Object.assign({}, state.user.precioPorPublico)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveUserSession: (user) => dispatch(saveUserSession(user))
  };
};

class PerfilCuidador extends React.Component {
  constructor(props) {
    super(props);

    this.requiredStates = [
      "txtNombre",
      "txtSexo",
      "txtFechaNacimiento",
      "txtMovil",
      "ubicaciones",
      "txtDescripcion"
    ];
    //El array de abajo es para traducir el error
    this.requiredStatesTraduc = {
      txtNombre: "registerFormCuidadores.nombre",
      txtSexo: "registerFormCuidadores.sexo",
      txtFechaNacimiento: "registerFormCuidadores.fechaNac",
      txtMovil: "registerFormCuidadores.movil",
      ubicaciones: "registerFormCuidadores.pueblosDisponible",
      txtDescripcion: "registerFormCuidadores.descripcion"
    };

    this.state = {
      isEditing: false,
      isLoading: false,
      txtNombre: this.props.nombre,
      txtApellido1: this.props.apellido1,
      txtApellido2: this.props.apellido2,
      txtSexo: this.props.sexo,
      txtFechaNacimiento: this.props.fechaNacimiento,
      txtMovil: this.props.movil,
      txtTelefono: this.props.telefFijo,
      diasDisponible: this.props.diasDisponible || [
        {
          dia: 0,
          horaInicio: "00:00",
          horaFin: "00:00"
        }
      ],
      publicoDisponible: this.props.publicoDisponible || {
        nino: false,
        terceraEdad: false,
        necesidadEspecial: false
      },
      precioPorPublico: this.props.precioPorPublico || {
        nino: "",
        terceraEdad: "",
        necesidadEspecial: ""
      },
      ubicaciones: this.props.ubicaciones || [],
      txtDescripcion: this.props.descripcion,
      isPublic: this.props.isPublic,
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
        imgContact: false
      }
    };

    this.handleEdit = this.handleEdit.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.handleGuardarCambios = this.handleGuardarCambios.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleSexHover = this.handleSexHover.bind(this);
    this.handleSexLeave = this.handleSexLeave.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
    this.addDiasDisponible = this.addDiasDisponible.bind(this);
    this.handleDiasDisponibleChange = this.handleDiasDisponibleChange.bind(
      this
    );
    this.removeDiasDisponible = this.removeDiasDisponible.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(
      this
    );
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(
      this
    );
    this.handleAuxAddPuebloChange = this.handleAuxAddPuebloChange.bind(this);
    this.handleAddPueblo = this.handleAddPueblo.bind(this);
    this.handleRemovePueblo = this.handleRemovePueblo.bind(this);
    this.handlePublicoChange = this.handlePublicoChange.bind(this);
    this.handlePublicoHover = this.handlePublicoHover.bind(this);
    this.handlePublicoLeave = this.handlePublicoLeave.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleIsPublicChange = this.handleIsPublicChange.bind(this);
    this.onChangeContactImg = this.onChangeContactImg.bind(this);
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

  onChangeContactImg(picture) {
    if (picture.length > 1) {
      picture.shift();
    }
    this.setState({
      imgContact: picture
    });
  }

  handleEdit() {
    this.setState({
      isEditing: true
    });
  }

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{trans("registerFormCuidadores.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
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

  handleCalendarChange(valor) {
    this.setState({
      txtFechaNacimiento: valor
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

  handleAuxAddPuebloChange(e, { newValue }) {
    this.setState({
      auxAddPueblo: newValue
    });
  }

  handleAddPueblo() {
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

  handleRemovePueblo() {
    this.setState({
      ubicaciones:
        typeof this.state.ubicaciones.pop() != "undefined"
          ? this.state.ubicaciones
          : []
    });
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

  handleIsPublicChange(valor) {
    this.setState({
      isPublic: valor
    });
  }

  async handleGuardarCambios() {
    {
      /* TODO Guardar los cambios en la base de datos y atualizar el estado de Redux */
    }
    for (var clave in this.state) {
      if (
        (this.state[clave].length == 0 || !this.state[clave]) &&
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

    this.setState({
      isLoading: true
    });

    var codContactImg = "";

    if (this.state.imgContact != "") {
      //Significa que quiere cambiar su imagen de contatco
      codContactImg = getRandomString(20);
      var imgContactB64 = await toBase64(this.state.imgContact[0]);

      await Axios.post("http://" + ipMaquina + ":3001/api/image/" + codContactImg, {
        imageB64: imgContactB64
      }).catch(err => {
        cogoToast.error(<h5>{trans("perfilCliente.errorAvatarUpload")}</h5>);
        return;
      });
    } else {
      codContactImg = this.props.direcFotoContacto;
    }
    {
      /* Imagen contacto guardado, ahora toca imagen perfil */
    }

    var codAvatar = "";
    if (this.state.avatarPreview != "") {
      codAvatar = getRandomString(20);
      await Axios.post("http://" + ipMaquina + ":3001/api/image/" + codAvatar, {
        imageB64: this.state.avatarPreview
      }).catch(error => {
        cogoToast.error(<h5>{trans("perfilCliente.errorAvatarUpload")}</h5>);
        return;
      });
    } else {
      codAvatar = this.props.direcFoto;
    }

    let formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      fechaNacimiento: this.state.txtFechaNacimiento,
      sexo: this.state.txtSexo,
      direcFoto: codAvatar,
      direcFotoContacto: codContactImg,
      descripcion: this.state.txtDescripcion,
      ubicaciones: this.state.ubicaciones,
      publicoDisponible: this.state.publicoDisponible,
      telefono: {
        movil: {
          etiqueta: "Movil",
          numero: this.state.txtMovil
        },
        fijo: {
          etiqueta: "Fijo",
          numero: this.state.txtTelefono
        }
      },
      isPublic: this.state.isPublic,
      precioPorPublico: this.state.precioPorPublico,
      diasDisponible: this.state.diasDisponible
    };

    Axios.patch(
      "http://" + ipMaquina + ":3001/api/cuidador/" + this.props._id,
      formData
    )
      .then(res => {

        this.props.saveUserSession(formData);
        cogoToast.success(<h5>{trans("perfilCliente.datosActualizados")}</h5>);
      })
      .catch(err => {
        cogoToast.error(<h5>{trans("perfilCliente.errorGeneral")}</h5>);
      })
      .finally(() => {
        this.setState({
          isLoading: false
        });
      });
  }

  render() {
    const onChangeSuggestion = this.handleAuxAddPuebloChange;
    const auxAddPuebloValue = this.state.auxAddPueblo;
    const classSuggestion = this.state.error.txtNombre
      ? "border border-danger form-control d-inline w-75"
      : "form-control d-inline w-100";

    const autoSuggestProps = {
      onChange: onChangeSuggestion,
      placeholder: "Introduce el pueblo...",
      value: auxAddPuebloValue,
      className: classSuggestion,
      disabled: !this.state.isEditing
    };

    const suggestionTheme = {
      container: "react-autosuggest__container",
      containerOpen: "react-autosuggest__container--open",
      input: "react-autosuggest__input",
      inputOpen: "react-autosuggest__input--open",
      inputFocused: "react-autosuggest__input--focused",
      suggestionsContainer: "list-group",
      suggestionsContainerOpen:
        "react-autosuggest__suggestions-container--open",
      suggestionsList: "list-group",
      suggestion: "list-group-item",
      suggestionFirst: "list-group-item",
      suggestionHighlighted: "bg-success text-light list-group-item",
      sectionContainer: "react-autosuggest__section-container",
      sectionContainerFirst: "react-autosuggest__section-container--first",
      sectionTitle: "react-autosuggest__section-title"
    };

    return (
      <div className="p-5">
        <div className="form-group row">
          <div className="form-group col-3 text-center">
            {!this.state.isEditing && this.props.direcFoto.length > 0 ? (
              <img
                height={200}
                width={200}
                src={
                  "http://" + ipMaquina + ":3001/api/image/" + this.props.direcFoto
                }
              />
            ) : (
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
            )}
          </div>
          <div className="col-3 mx-auto text-center">
            {!this.state.isEditing ? (
              <div
                style={{
                  //backgroundImage:"url(http://" + ipMaquina + ":3001/api/image/" + cuidador.direcFotoContacto + ")",
                  height: "300px",
                  backgroundSize: "cover",
                  backgroundPosition: "top",
                  backgroundRepeat: "no-repeat",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
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
              <ImageUploader
                fileContainerStyle={
                  this.state.imgContact != ""
                    ? { background: "#28a745" }
                    : this.state.error.txtNombre
                    ? { background: "#dc3545" }
                    : {}
                }
                buttonClassName={
                  this.state.imgContact != "" ? "bg-light text-dark" : ""
                }
                errorClass="bg-danger text-light"
                fileSizeError="handiegia da"
                fileTypeError="ez du formatu zuzena"
                singleImage={true}
                label={
                  this.state.imgContact != ""
                    ? "Gehienez: 5MB | " +
                      this.state.imgContact[0].name +
                      " (" +
                      (this.state.imgContact[0].size / 1024 / 1024).toFixed(2) +
                      " MB)"
                    : "Gehienez: 5MB | Gomendaturiko dimentsioa (288x300)"
                }
                labelClass={
                  this.state.imgContact != ""
                    ? "text-light font-weight-bold"
                    : ""
                }
                withIcon={true}
                buttonText={
                  this.state.imgContact != ""
                    ? "Aukeratu beste irudi bat"
                    : "Aukeratu zure kontaktu irudia"
                }
                onChange={this.onChangeContactImg}
                imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                maxFileSize={5242880}
              />
            )}
          </div>

          <div className="form-group col-6">
            <div class="form-group">
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
                disabled={this.state.isEditing ? null : "disabled"}
                id="txtNombre"
                aria-describedby="txtNombreHelp"
                placeholder="Introducir nombre..."
                value={this.state.txtNombre}
              />
            </div>
            <div class="form-group row">
              <div className="form-group col">
                <label htmlFor="txtApellido1">
                  {trans("registerFormCuidadores.apellido1")}
                </label>
                <input
                  onChange={this.handleInputChange}
                  type="text"
                  class="form-control"
                  disabled={this.state.isEditing ? null : "disabled"}
                  id="txtApellido1"
                  aria-describedby="txtNombreHelp"
                  placeholder="Introducir apellido 1..."
                  value={this.state.txtApellido1}
                />
              </div>
              <div className="form-group col">
                <label htmlFor="txtApellido2">
                  {trans("registerFormCuidadores.apellido2")}
                </label>
                <input
                  onChange={this.handleInputChange}
                  type="text"
                  class="form-control"
                  disabled={this.state.isEditing ? null : "disabled"}
                  id="txtApellido2"
                  aria-describedby="txtNombreHelp"
                  placeholder="Introducir apellido 2..."
                  value={this.state.txtApellido2}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <div className="form-group col-6">
            <label htmlFor="txtFechaNacimiento">
              {trans("registerFormCuidadores.fechaNac")}
            </label>{" "}
            (<span className="text-danger font-weight-bold">*</span>)
            <br />
            <Calendario
              dateFormat="YYYY/MM/DD"
              inputClassName={
                this.state.isEditing ? "form-control" : "form-control disabled"
              }
              displayCalendars={this.state.isEditing ? 1 : 0}
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
              disableInputIcon={!this.state.isEditing}
              highlightWeekends={true}
            />
          </div>
          <div
            className={
              this.state.error.txtNombre
                ? "form-group col-3 text-center p-1 border border-danger"
                : "form-group col-3 text-center p-1"
            }
            onClick={() =>
              this.state.isEditing ? this.handleSexChange("M") : null
            }
            onMouseEnter={() =>
              this.state.isEditing ? this.handleSexHover("hoverSexoM") : null
            }
            onMouseLeave={() =>
              this.state.isEditing ? this.handleSexLeave("hoverSexoM") : null
            }
            id="txtSexM"
            style={{
              borderRadius: "8px",
              cursor: this.state.isEditing ? "pointer" : "no-drop",
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
                ? "form-group col-3 text-center p-1 border border-danger"
                : "form-group col-3 text-center p-1"
            }
            id="txtSexF"
            onClick={() =>
              this.state.isEditing ? this.handleSexChange("F") : null
            }
            onMouseEnter={() =>
              this.state.isEditing ? this.handleSexHover("hoverSexoF") : null
            }
            onMouseLeave={() =>
              this.state.isEditing ? this.handleSexLeave("hoverSexoF") : null
            }
            style={{
              borderRadius: "8px",
              cursor: this.state.isEditing ? "pointer" : "no-drop",
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
        <div className="form-group row">
          <div class="form-group col">
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
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtMovil"
              aria-describedby="emailHelp"
              placeholder="Introducir movil..."
              value={this.state.txtMovil}
            />
          </div>
          <div className="col">
            <label className="" htmlFor="txtTelefono">
              {trans("registerFormCuidadores.telefFijo")}
            </label>
            <input
              onChange={this.handleInputChange}
              type="number"
              class="form-control"
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtTelefono"
              placeholder="Introducir telefono fijo..."
              value={this.state.txtTelefono}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="form-group col">
            {/* Insertar dias disponibles aqui */}
            <label className="w-100 text-center lead">
              {trans("registerFormCuidadores.diasDisponible")}:
            </label>
            <br />
            <div className="w-100 mt-2" id="diasDisponible">
              {/* Aqui iran los dias dinamicamente */}
              {this.state.diasDisponible.map((objDia, indice) => {
                return (
                  <div
                    className="col-6 mx-auto text-center"
                    id={"diaDisponible" + indice}
                  >
                    <div className="form-control mt-4 w-100">
                      <select
                        disabled={this.state.isEditing ? null : "disabled"}
                        value={this.state.diasDisponible[indice].dia}
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
                      <br />
                      <br />
                      <b>{trans("registerFormCuidadores.horaInicio")} :</b>
                      <TimeInput
                        onTimeChange={valor => {
                          this.handleDiasDisponibleChange(
                            valor,
                            "horaInicio" + indice
                          );
                        }}
                        id={"horaInicio" + indice}
                        disabled={this.state.isEditing ? null : "disabled"}
                        initTime={
                          this.state.diasDisponible[indice].horaInicio !=
                          "00:00"
                            ? this.state.diasDisponible[indice].horaInicio
                            : "00:00"
                        }
                        className="mt-1 text-center d-inline form-control"
                      />
                      <br />
                      <b>{trans("registerFormCuidadores.horaFin")} :</b>
                      <TimeInput
                        onTimeChange={valor => {
                          this.handleDiasDisponibleChange(
                            valor,
                            "horaFin" + indice
                          );
                        }}
                        id={"horaFin" + indice}
                        disabled={this.state.isEditing ? null : "disabled"}
                        initTime={
                          this.state.diasDisponible[indice].horaFin != "00:00"
                            ? this.state.diasDisponible[indice].horaFin
                            : "00:00"
                        }
                        className="mt-1 text-center d-inline form-control"
                      />
                      <br />
                      <br />
                    </div>
                  </div>
                );
              })}
              <div id="botonesDiasDisponible" className="w-100 mt-2">
                {this.state.diasDisponible.length > 0 ? (
                  <a
                    onClick={this.removeDiasDisponible}
                    className={
                      this.state.isEditing
                        ? "btn btn-danger float-left text-light"
                        : "btn btn-danger float-left text-light disabled"
                    }
                  >
                    {trans("registerFormCuidadores.eliminarDia")}{" "}
                    <FontAwesomeIcon icon={faMinusCircle} />
                  </a>
                ) : (
                  ""
                )}
                <a
                  onClick={this.addDiasDisponible}
                  className={
                    this.state.isEditing
                      ? "btn btn-success float-right text-light"
                      : "btn btn-success float-right text-light disabled"
                  }
                >
                  {trans("registerFormCuidadores.anadir")}{" "}
                  <FontAwesomeIcon icon={faPlusCircle} />
                </a>
              </div>
            </div>
          </div>
          <div className="form-group col">
            {/* Insertar ubicaciones disponibles aqui */}
            <label htmlFor="txtAddPueblos" className="w-100 text-center lead">
              {trans("registerFormCuidadores.pueblosDisponible")}:
            </label>{" "}
            (<span className="text-danger font-weight-bold">*</span>)
            <div class="form-group mt-2">
              <AutoSuggest
                suggestions={this.state.suggestionsPueblos}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.handleAddPueblo}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={autoSuggestProps}
                theme={suggestionTheme}
                id="txtAddPueblos"
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
                  className={
                    this.state.isEditing
                      ? "mt-4 btn btn-danger float-right text-light"
                      : "mt-4 btn btn-danger float-right text-light disabled"
                  }
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
        <div className="form-group row">
          <div className="form-group col">
            {/* Insertar publico disponibles aqui */}
            <label className="w-100 text-center lead">
              {trans("registerFormCuidadores.publicoDisponible")}:
            </label>
            <div className="row md-2">
              <div
                onClick={() =>
                  this.state.isEditing ? this.handlePublicoChange("nino") : null
                }
                onMouseEnter={() =>
                  this.state.isEditing
                    ? this.handlePublicoHover("hoverNino")
                    : null
                }
                onMouseLeave={() =>
                  this.state.isEditing
                    ? this.handlePublicoLeave("hoverNino")
                    : null
                }
                className="col-4 text-center p-1"
                style={{
                  background: this.state.publicoDisponible.nino
                    ? "#28a745"
                    : this.state.hoverNino
                    ? "#545b62"
                    : "",
                  cursor: this.state.isEditing ? "pointer" : "no-drop"
                }}
              >
                <img src={imgNino} className="w-100 h-100" />
                <small className="font-weight-bold">
                  {trans("registerFormCuidadores.ninos")}
                </small>
              </div>
              <div
                onClick={() =>
                  this.state.isEditing
                    ? this.handlePublicoChange("terceraEdad")
                    : null
                }
                onMouseEnter={() =>
                  this.state.isEditing
                    ? this.handlePublicoHover("hoverTerceraEdad")
                    : null
                }
                onMouseLeave={() =>
                  this.state.isEditing
                    ? this.handlePublicoLeave("hoverTerceraEdad")
                    : null
                }
                className="col-4 text-center p-1"
                style={{
                  background: this.state.publicoDisponible.terceraEdad
                    ? "#28a745"
                    : this.state.hoverTerceraEdad
                    ? "#545b62"
                    : "",
                  cursor: this.state.isEditing ? "pointer" : "no-drop"
                }}
              >
                <img src={imgTerceraEdad} className="w-100 h-100" />
                <small className="font-weight-bold">
                  {trans("registerFormCuidadores.terceraEdad")}
                </small>
              </div>
              <div
                onClick={() =>
                  this.state.isEditing
                    ? this.handlePublicoChange("necesidadEspecial")
                    : null
                }
                onMouseEnter={() =>
                  this.state.isEditing
                    ? this.handlePublicoHover("hoverNecesidadEspecial")
                    : null
                }
                onMouseLeave={() =>
                  this.state.isEditing
                    ? this.handlePublicoLeave("hoverNecesidadEspecial")
                    : null
                }
                className="col-4 text-center p-1"
                style={{
                  background: this.state.publicoDisponible.necesidadEspecial
                    ? "#28a745"
                    : this.state.hoverNecesidadEspecial
                    ? "#545b62"
                    : "",
                  cursor: this.state.isEditing ? "pointer" : "no-drop"
                }}
              >
                <img src={imgNecesidadEspecial} className="w-100 h-100" />
                <small className="font-weight-bold">
                  {trans("registerFormCuidadores.necesidadEspecial")}
                </small>
              </div>
            </div>
          </div>
          <div className="form-group col">
            {/* Insertar precioPublico disponibles aqui */}
            <label className="w-100 text-center lead">
              {trans("registerFormCuidadores.precioPorPublico")}:
            </label>
            <div className="list-group md-2">
              <div className="list-group-item form-group text-center p-1">
                <small>
                  <b>{trans("registerFormCuidadores.ninos")}</b>
                </small>
                <input
                  onChange={event => {
                    this.handlePrecioChange("nino", event.target.value);
                  }}
                  className="form-control"
                  disabled={
                    !this.state.isEditing
                      ? true
                      : !this.state.publicoDisponible.nino
                  }
                  value={this.state.precioPorPublico.nino}
                  type="number"
                  placeholder="Prezioa €/h"
                />
              </div>
              <div className="list-group-item form-group text-center p-1">
                <small>
                  <b>{trans("registerFormCuidadores.terceraEdad")}</b>
                </small>
                <input
                  onChange={event => {
                    this.handlePrecioChange("terceraEdad", event.target.value);
                  }}
                  disabled={
                    !this.state.isEditing
                      ? true
                      : !this.state.publicoDisponible.terceraEdad
                  }
                  value={this.state.precioPorPublico.terceraEdad}
                  className="form-control"
                  type="number"
                  placeholder="Prezioa €/h"
                />
              </div>
              <div className="list-group-item form-group text-center p-1">
                <small>
                  <b>{trans("registerFormCuidadores.necesidadEspecial")}</b>
                </small>
                <input
                  onChange={event => {
                    this.handlePrecioChange(
                      "necesidadEspecial",
                      event.target.value
                    );
                  }}
                  disabled={
                    !this.state.isEditing
                      ? true
                      : !this.state.publicoDisponible.necesidadEspecial
                  }
                  value={this.state.precioPorPublico.necesidadEspecial}
                  className="form-control"
                  type="number"
                  placeholder="Prezioa €/h"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
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
            disabled={!this.state.isEditing}
            rows="5"
            id="txtDescripcion"
            placeholder="Tu descripcion..."
            value={this.state.txtDescripcion}
          ></textarea>
        </div>

        <div>
          <Switch
            onChange={this.handleIsPublicChange}
            checked={this.state.isPublic}
            disabled={!this.state.isEditing}
            id="isPublic"
          />
          <br />
          <small>{trans("registerFormCuidadores.publicarAuto")}</small>
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
              <img src={"http://" + ipMaquina + ":3001/api/image/loadGif"} height={50} width={50} />
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
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCuidador);
