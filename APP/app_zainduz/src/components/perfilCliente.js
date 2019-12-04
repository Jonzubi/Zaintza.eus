import React from "react";
import Avatar from "react-avatar-edit";
import { connect } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
import { saveUserSession } from "../redux/actions/user";
import { t, getRandomString } from "../util/funciones";
import ipMaquina from "../util/ipMaquinaAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { loadGif } from "../util/gifs/loadGif.gif";
import Axios from "axios";
import cogoToast from "cogo-toast";

const mapStateToProps = state => {
  console.log(state);
  //Aqui van los especialitos de los undefined
  const movil =
    typeof state.user.telefono == "undefined"
      ? undefined
      : state.user.telefono.movil.numero;
  const telefFijo =
    typeof state.user.telefono == "undefined"
      ? undefined
      : state.user.telefono.fijo.numero;
  return {
    _id: state.user._id,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    apellido2: state.user.apellido2,
    direcFoto: state.user.direcFoto,
    movil: movil,
    telefFijo: telefFijo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form)),
    saveUserSession: user => dispatch(saveUserSession(user))
  };
};

class PerfilCliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarPreview: "",
      isEditing: false,
      isLoading: false,
      txtNombre: this.props.nombre,
      txtApellido1: this.props.apellido1,
      txtApellido2: this.props.apellido2,
      txtMovil: this.props.movil,
      txtFijo: this.props.telefFijo,
      isLoading: false,
      error: {
        txtNombre: false,
        txtEmail: false,
        txtContrasena: false,
        txtMovil: false
      }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
  }

  handleEdit() {
    this.setState({
      isEditing: true
    });
  }

  async handleGuardarCambios() {
    this.setState({
      isLoading: true
    });

    let formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      telefono: {
        movil: {
          etiqueta: "Movil",
          numero: this.state.txtMovil
        },
        fijo: {
          etiqueta: "Fijo",
          numero: this.state.txtFijo
        }
      }
    };

    var codAvatar = "";
    if(this.state.avatarPreview != ""){
      codAvatar = getRandomString(20);
      await Axios
        .post("http://" + ipMaquina + ":3001/image/" + codAvatar, {
          imageB64: this.state.avatarPreview
        })
        .catch(error => {
          cogoToast.error(
            <h5>{t("perfilCliente.errorAvatarUpload")}</h5>
          );
          return;
        });
      formData.direcFoto = codAvatar;
    }
    else{
      formData.direcFoto = this.props.direcFoto;
    }

    Axios
        .patch("http://" + ipMaquina + ":3001/cliente/" + this.props._id, formData)
        .then(
          resultado => {
            formData.tipoUsuario = "C";

            this.props.saveUserSession(formData);
            cogoToast.success(
            <h5>{t('perfilCliente.datosActualizados')}</h5>
            );            
          }
        )
        .catch(
          err => {
            cogoToast.error(
              <h5>{t('perfilCliente.errorGeneral')}</h5>
              )
          }          
        )
        .finally(() => {
          this.setState({
            isLoading: false
          })
        });
  }

  handleInputChange(e) {
    console.log(this.state);
    //La idea es recoger el nombre del componente y asignarselo al estado, algo como, this.setState({this.state[name] = e.target.value});
    var stateId = e.target.id;
    //No vamos a dejar que el usuario meta mas de 9 digitos para el telefono
    if (stateId == "txtMovil" || stateId == "txtFijo") {
      if (e.target.value.toString() > 9) {
        e.target.value = e.target.value.slice(0, 9);
      }
    }
    this.setState({
      [stateId]: e.target.value
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
      cogoToast.error(<h5>{t("perfilCliente.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
  }

  render() {
    return (
      <div className="p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          {!this.state.isEditing ? (
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
              src={this.state.avatarPreview}
            />
          )}
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtNombre">{t("perfilCliente.nombre")}</label> (
            <span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="text"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtNombre"
              aria-describedby="txtNombreHelp"
              placeholder="Izena..."
              value={this.state.txtNombre}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-6">
            <label htmlFor="txtApellido1">{t("perfilCliente.apellido1")}</label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtApellido1"
              aria-describedby="txtNombreHelp"
              placeholder="Lehen abizena..."
              value={this.state.txtApellido1}
            />
          </div>
          <div className="col-6">
            <label htmlFor="txtApellido2">{t("perfilCliente.apellido2")}</label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtApellido2"
              aria-describedby="txtNombreHelp"
              placeholder="Bigarren abizena..."
              value={this.state.txtApellido2}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-6">
            <label htmlFor="txtMovil">{t("perfilCliente.movil")}</label> (
            <span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtMovil"
              placeholder="Sartu mugikorra..."
              value={this.state.txtMovil}
            />
          </div>
          <div className="col-6">
            <label htmlFor="txtFijo">{t("perfilCliente.telefFijo")}</label>{" "}
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtFijo
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled={this.state.isEditing ? null : "disabled"}
              id="txtFijo"
              placeholder="Sartu telefono finkoa..."
              value={this.state.txtFijo}
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

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCliente);
