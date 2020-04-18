import React from "react";
import Avatar from "react-avatar-edit";
import { connect } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
import { saveUserSession } from "../redux/actions/user";
import { trans } from "../util/funciones";
import ipMaquina from "../util/ipMaquinaAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { loadGif } from "../util/gifs/loadGif.gif";
import Axios from "axios";
import cogoToast from "cogo-toast";

const mapStateToProps = state => {
  //Aqui van los especialitos de los undefined
  return {
    _id: state.user._id,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    apellido2: state.user.apellido2,
    direcFoto: state.user.direcFoto,
    movil: state.user.telefonoMovil,
    telefFijo: state.user.telefonoFijo,
    email: state.user.email,
    contrasena: state.user.contrasena,
    idUsuario: state.user._idUsuario
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
        txtMovil: false
      }
    };

    this.requiredState = ["txtNombre", "txtMovil"];
    this.requiredStatesTraduc = {
      txtNombre: "registerFormClientes.nombre",
      txtMovil: "registerFormClientes.movil"
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
    const { email, contrasena, idUsuario } = this.props;
    for (var clave in this.state) {
      if (
        (this.state[clave].length == 0 || !this.state[clave]) &&
        this.requiredState.includes(clave)
      ) {
        cogoToast.error(
          <h5>
            {trans("registerFormClientes.errorRellenaTodo")} (
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
    }

    this.setState({
      isLoading: true
    });

    let formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      telefonoMovil: this.state.txtMovil,
      telefonoFijo: this.state.txtFijo,
      avatarPreview : this.state.avatarPreview,
      email,
      contrasena,
      idUsuario
    };

    Axios
        .patch("http://" + ipMaquina + ":3001/api/procedures/patchCliente/" + this.props._id, formData)
        .then(
          resultado => {
            const { direcFoto } = resultado.data;
            this.props.saveUserSession(Object.assign({}, formData, {direcFoto: direcFoto}));
            cogoToast.success(
            <h5>{trans('perfilCliente.datosActualizados')}</h5>
            );            
          }
        )
        .catch(
          err => {
            cogoToast.error(
              <h5>{trans('perfilCliente.errorGeneral')}</h5>
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
      cogoToast.error(<h5>{trans("perfilCliente.errorImgGrande")}</h5>);
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
              src={this.state.avatarPreview}
            />
          )}
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtNombre">{trans("perfilCliente.nombre")}</label> (
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
            <label htmlFor="txtApellido1">{trans("perfilCliente.apellido1")}</label>
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
            <label htmlFor="txtApellido2">{trans("perfilCliente.apellido2")}</label>
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
            <label htmlFor="txtMovil">{trans("perfilCliente.movil")}</label> (
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
            <label htmlFor="txtFijo">{trans("perfilCliente.telefFijo")}</label>{" "}
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

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCliente);
