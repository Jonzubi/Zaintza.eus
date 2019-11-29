import React from "react";
import Avatar from "react-avatar-edit";
import {connect} from "react-redux";
import {changeFormContent} from "../redux/actions/app";
import {t} from "../util/funciones";
import ipMaquina from "../util/ipMaquinaAPI";

const mapStateToProps = state => {
    console.log(state);
    //Aqui van los especialitos de los undefined
    const movil = typeof state.user.telefono.movil == "undefined" ? undefined : state.user.telefono.movil.numero;
    const telefFijo = typeof state.user.telefono.fijo == "undefined" ? undefined : state.user.telefono.fijo.numero;
    return {
        nombre: state.user.nombre,
        apellido1: state.user.apellido1,
        apellido2: state.user.apellido2,
        email: state.user.email,
        direcFoto: state.user.direcFoto,
        movil: movil,
        telefFijo: telefFijo
    }
}

const mapDispatchToProps = dispatch => {
    return {
         changeFormContent: (form) => dispatch(changeFormContent(form))
    }
}

class PerfilCliente extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      avatarPreview: "",
      txtNombre: this.props.nombre,
      txtApellido1: this.props.apellido1,
      txtApellido2: this.props.apellido2,
      txtEmail: this.props.email,
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

  render() {
    return (
      <div className="p-5">
        <div className="form-group d-flex justify-content-center position-relative">
          <img
            height={200}
            width={200}
            src={"http://" + ipMaquina + ":3001/image/" + this.props.direcFoto}
          />
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtNombre">
              {t("registerFormClientes.nombre")}
            </label>{" "}
            (<span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="text"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtNombre"
              aria-describedby="txtNombreHelp"
              placeholder="Izena..."
              value={this.state.txtNombre}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-6">
            <label htmlFor="txtApellido1">
              {t("registerFormClientes.apellido1")}
            </label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtApellido1"
              aria-describedby="txtNombreHelp"
              placeholder="Lehen abizena..."
              value={this.state.txtApellido1}
            />
          </div>
          <div className="col-6">
            <label htmlFor="txtApellido2">
              {t("registerFormClientes.apellido2")}
            </label>
            <input
              onChange={this.handleInputChange}
              type="text"
              className="form-control"
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtApellido2"
              aria-describedby="txtNombreHelp"
              placeholder="Bigarren abizena..."
              value={this.state.txtApellido2}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="txtEmail">
              {t("registerFormClientes.email")}
            </label>{" "}
            (<span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="email"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtEmail"
              aria-describedby="emailHelp"
              placeholder="Sartu emaila..."
              value={this.state.txtEmail}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-6">
          <label htmlFor="txtMovil">
              {t("registerFormClientes.movil")}
            </label>{" "}
            (<span className="text-danger font-weight-bold">*</span>)
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtMovil"
              placeholder="Sartu mugikorra..."
              value={this.state.txtMovil}
            />
          </div>
          <div className="col-6">
          <label htmlFor="txtFijo">
              {t("registerFormClientes.telefFijo")}
            </label>{" "}
            <input
              onChange={this.handleInputChange}
              type="number"
              className={
                this.state.error.txtFijo
                  ? "border border-danger form-control"
                  : "form-control"
              }
              disabled = {this.state.isEditing ? null : "disabled"}
              id="txtFijo"
              placeholder="Sartu telefono finkoa..."
              value={this.state.txtFijo}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PerfilCliente);
