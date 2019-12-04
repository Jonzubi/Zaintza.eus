import React from "react";
import Avatar from "react-avatar-edit";
import cogoToast from "cogo-toast";
import loadGif from "../util/gifs/loadGif.gif";
import { connect } from "react-redux";
import { t, getRandomString } from "../util/funciones";
import { saveUserSession } from "../redux/actions/user";
import { changeFormContent } from "../redux/actions/app";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";

const mapDispatchToProps = dispatch => {
  return {
    saveUserSession: payload => dispatch(saveUserSession(payload)),
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

class RegisterFormCliente extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarPreview: "",
      txtNombre: "",
      txtApellido1: "",
      txtApellido2: "",
      txtEmail: "",
      txtContrasena: "",
      txtMovil: "",
      txtFijo: "",
      isLoading: false,
      error: {
        txtNombre: false,
        txtEmail: false,
        txtContrasena: false,
        txtMovil: false
      }
    };

    this.requiredState = ["txtNombre", "txtEmail", "txtContrasena", "txtMovil"];
    this.requiredStatesTraduc = {
      txtNombre: "registerFormClientes.nombre",
      txtEmail: "registerFormClientes.email",
      txtContrasena: "registerFormClientes.contrasena",
      txtMovil: "registerFormClientes.movil"
    };

    this.onClose = this.onClose.bind(this);
    this.onCrop = this.onCrop.bind(this);
    this.onBeforeFileLoad = this.onBeforeFileLoad.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRegistrarse = this.handleRegistrarse.bind(this);
  }

  onClose() {
    this.setState({ avatarPreview: "" });
  }

  onCrop(preview) {
    this.setState({ avatarPreview: preview });
  }

  onBeforeFileLoad(elem) {
    if (elem.target.files[0].size > 5242880) {
      cogoToast.error(<h5>{t("registerFormClientes.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
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

  async handleRegistrarse() {
    for (var clave in this.state) {
      if (
        (this.state[clave].length == 0 || !this.state[clave]) &&
        this.requiredState.includes(clave)
      ) {
        cogoToast.error(
          <h5>
            {t("registerFormClientes.errorRellenaTodo")} (
            {t(this.requiredStatesTraduc[clave])})
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
    this.setState({ isLoading: true });

    var codAvatar = getRandomString(20);

    if (this.state.avatarPreview.length > 0) {
      await axios
        .post("http://" + ipMaquina + ":3001/image/" + codAvatar, {
          imageB64: this.state.avatarPreview
        })
        .catch(error => {
          cogoToast.error(
            <h5>{t("registerFormClientes.errorAvatarUpload")}</h5>
          );
          return;
        });
    }

    var formData = {
      nombre: this.state.txtNombre,
      apellido1: this.state.txtApellido1,
      apellido2: this.state.txtApellido2,
      telefono: {
        movil:{
          etiqueta: "Movil",
          numero: this.state.txtMovil
        },
        fijo:{
          etiqueta: "Fijo",
          numero: this.state.txtFijo
        }
      },
      direcFoto: codAvatar
    };

    axios
      .post("http://" + ipMaquina + ":3001/cliente/", formData)
      .then(cliente => {
        var idPerfil = cliente.data;
        //recogemos el _id que se ha generado al registrar el cliente
        idPerfil = idPerfil._id;

        var formDataUsu = {
          email: this.state.txtEmail,
          contrasena: this.state.txtContrasena,
          tipoUsuario: "C",
          idPerfil: idPerfil
        };
        axios
          .post("http://" + ipMaquina + ":3001/usuario/", formDataUsu)
          .then(resultado => {
            this.props.saveUserSession(Object.assign({},formData, {tipoUsuario: "C", email: formDataUsu.email, _id: idPerfil, _idUsuario: resultado.data._id}));

            this.state = {
              avatarPreview: "",
              txtNombre: "",
              txtApellido1: "",
              txtApellido2: "",
              txtEmail: "",
              txtContrasena: "",
              isLoading: false,
              error: {
                txtNombre: false,
                txtEmail: false,
                txtContrasena: false,
                txtMovil: false
              }
            };
            cogoToast.success(
              <div>
                <h5>{t("registerFormClientes.registroCompletado")}</h5>
                <small>
                  <b>{t("registerFormClientes.darGracias")}</b>
                </small>
              </div>
            );
            this.props.changeFormContent("tabla");
          });
      })
      .catch(err => {
        this.setState({
          isLoading: false
        });
        cogoToast.error(<h5>{t("registerFormClientes.errorGeneral")}</h5>);
      })
      .catch(err => {
        this.setState({
          isLoading: false
        });
        cogoToast.error(<h5>{t("registerFormClientes.errorGeneral")}</h5>);
      });
  }

  render() {
    return (
      <div
        className="p-5"
      >
        <div className="form-group d-flex justify-content-center position-relative">
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
              id="txtApellido2"
              aria-describedby="txtNombreHelp"
              placeholder="Bigarren abizena..."
              value={this.state.txtApellido2}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-6">
            <label htmlFor="txtEmail">
              {t("registerFormClientes.email")}
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
              placeholder="Sartu emaila..."
              value={this.state.txtEmail}
            />
          </div>
          <div className="col-6">
            <label htmlFor="txtContrasena">
              {t("registerFormClientes.contrasena")}
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
              placeholder="Sartu pasahitza..."
              value={this.state.txtContrasena}
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
              class={
                this.state.error.txtNombre
                  ? "border border-danger form-control"
                  : "form-control"
              }
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
              class={
                this.state.error.txtFijo
                  ? "border border-danger form-control"
                  : "form-control"
              }
              id="txtFijo"
              placeholder="Sartu telefono finkoa..."
              value={this.state.txtFijo}
            />
          </div>
        </div>
        <div id="loaderOrButton" className="w-100 mt-5 text-center">
          {this.state.isLoading ? (
            <img src={loadGif} height={50} width={50} />
          ) : (
            <button
              onClick={this.handleRegistrarse}
              type="button"
              className="w-100 btn btn-success "
            >
              {t("registerFormClientes.registrarse")}
            </button>
          )}
        </div>        
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(RegisterFormCliente);