import React from "react";
import { connect } from "react-redux";
import Avatar from "react-avatar-edit";
import ImageUploader from "react-images-upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import cogoToast from "cogo-toast";
import {t} from "../util/funciones";
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

      this.handleEdit = this.handleEdit.bind(this);
      this.onClose = this.onClose.bind(this);
      this.onCrop = this.onCrop.bind(this);
      this.handleGuardarCambios = this.handleGuardarCambios.bind(this);
  }

  handleEdit() {
    this.setState({
      isEditing: true
    });
  }

  handleGuardarCambios(){

  }

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

  render() {
    return (
      <div className="p-5">
        <div className="form-group row">
          <div className="form-group col-3 text-center">
            {this.state.direcFoto}
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
          <div className="col-3 mx-auto text-center">
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
