import React from "react";
import { connect } from "react-redux";
import Avatar from "react-avatar-edit";
import ImageUploader from "react-images-upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faMale,
  faFemale
} from "@fortawesome/free-solid-svg-icons";
import { ReactDatez as Calendario } from "react-datez";
import cogoToast from "cogo-toast";
import { t } from "../util/funciones";
import ipMaquina from "../util/ipMaquinaAPI";
import loadGif from "../util/gifs/loadGif.gif";

const mapStateToProps = state => {
  console.log(state);
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
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    apellido2: state.user.apellido2,
    sexo: state.user.sexo,
    fechaNacimiento: state.user.fechaNacimiento,
    direcFoto: state.user.direcFoto,
    direcFotoContacto: state.user.direcFotoContacto,
    movil: movil,
    telefFijo: telefFijo
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

class PerfilCuidador extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      isLoading: false,
      txtNombre: this.props.nombre,
      txtApellido1: this.props.apellido1,
      txtApellido2: this.props.apellido2,
      txtSexo: this.props.sexo,
      txtFechaNacimiento: this.props.fechaNacimiento,
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

    this.handleEdit = this.handleEdit.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.handleGuardarCambios = this.handleGuardarCambios.bind(this);
    this.handleSexChange = this.handleSexChange.bind(this);
    this.handleSexHover = this.handleSexHover.bind(this);
    this.handleSexLeave = this.handleSexLeave.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
  }

  handleEdit() {
    this.setState({
      isEditing: true
    });
  }

  handleGuardarCambios() {}

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{t("registerFormCuidadores.errorImgGrande")}</h5>);
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
    console.log(valor);
    this.setState({
      txtFechaNacimiento: valor
    });
  }

  render() {
    return (
      <div className="p-5">
        <div className="form-group row">
          <div className="form-group col-3 text-center">
            {!this.state.isEditing && this.props.direcFoto.length > 0 ? (
              <img
                height={200}
                width={200}
                src={
                  "http://" + ipMaquina + ":3001/image/" + this.props.direcFoto
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
                  //backgroundImage:"url(http://" + ipMaquina + ":3001/image/" + cuidador.direcFotoContacto + ")",
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
                    ":3001/image/" +
                    this.props.direcFotoContacto
                  }
                />
              </div>
            ) : (
              <ImageUploader
                fileContainerStyle={
                  this.state.imgContact != null
                    ? { background: "#28a745" }
                    : this.state.error.txtNombre
                    ? { background: "#dc3545" }
                    : {}
                }
                buttonClassName={
                  this.state.imgContact != null ? "bg-light text-dark" : ""
                }
                errorClass="bg-danger text-light"
                fileSizeError="handiegia da"
                fileTypeError="ez du formatu zuzena"
                singleImage={true}
                label={
                  this.state.imgContact != null
                    ? "Gehienez: 5MB | " +
                      this.state.imgContact[0].name +
                      " (" +
                      (this.state.imgContact[0].size / 1024 / 1024).toFixed(2) +
                      " MB)"
                    : "Gehienez: 5MB | Gomendaturiko dimentsioa (288x300)"
                }
                labelClass={
                  this.state.imgContact != null
                    ? "text-light font-weight-bold"
                    : ""
                }
                withIcon={true}
                buttonText={
                  this.state.imgContact != null
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
                {t("registerFormCuidadores.nombre")}
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
                  {t("registerFormCuidadores.apellido1")}
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
                  {t("registerFormCuidadores.apellido2")}
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
              {t("registerFormCuidadores.fechaNac")}
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
              {t("registerFormCuidadores.movil")}
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
              placeholder="Introducir movil..."
              value={this.state.txtMovil}
            />
          </div>
          <div className="col">
            <label className="" htmlFor="txtTelefono">
              {t("registerFormCuidadores.telefFijo")}
            </label>
            <input
              onChange={this.handleInputChange}
              type="number"
              class="form-control"
              id="txtTelefono"
              placeholder="Introducir telefono fijo..."
              value={this.state.txtTelefono}
            />
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
                {t("perfilCliente.editar")}
                <FontAwesomeIcon className="ml-1" icon={faEdit} />
              </button>
            ) : this.state.isLoading ? (
              <img src={loadGif} height={50} width={50} />
            ) : (
              <button
                onClick={() => this.handleGuardarCambios()}
                type="button"
                className="w-100 btn btn-success"
              >
                {t("perfilCliente.guardarCambios")}
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
