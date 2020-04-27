import React from "react";
import Avatar from "react-avatar-edit";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import { trans, getRandomString } from "../util/funciones";
import { saveUserSession } from "../redux/actions/user";
import { changeFormContent } from "../redux/actions/app";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import SocketContext from "../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faAt, faKey, faMobileAlt, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import i18next from "i18next";

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
      cogoToast.error(<h5>{trans("registerFormClientes.errorImgGrande")}</h5>);
      elem.target.value = "";
    }
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

  async handleRegistrarse(socket) {
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

    const checkIfEmailExists = await axios.get(
      `http://${ipMaquina}:3001/api/procedures/checkIfEmailExists/${this.state.txtEmail}`
    );

    if (checkIfEmailExists.data !== "Vacio") {
      cogoToast.error(<h5>{trans("registerFormCuidadores.emailExistente")}</h5>);
      return;
    }

    this.setState({ isLoading: true });

    const { txtNombre, txtApellido1, txtApellido2, txtMovil, txtFijo, avatarPreview, txtEmail, txtContrasena} = this.state;

    const validationToken = getRandomString(30);

    var formData = {
      nombre: txtNombre,
      apellido1: txtApellido1,
      apellido2: txtApellido2,
      telefonoMovil: txtMovil,
      telefonoFijo: txtFijo,
      avatarPreview: avatarPreview,
      email: txtEmail,
      contrasena: txtContrasena,
      validationToken
    };

    const insertedCliente = await axios
      .post(
        "http://" + ipMaquina + ":3001/api/procedures/postNewCliente",
        formData
      )
      .catch(err => {
        this.setState({
          isLoading: false
        });
        cogoToast.error(<h5>{trans("registerFormClientes.errorGeneral")}</h5>);
        return;
      });
      
      if (insertedCliente === undefined) {
        //Si entra aqui el servidor a tenido un error
        //Por ahora ese error seria un duplicado de email
        return;
      }
    
      axios.post(`http://${ipMaquina}:3003/smtp/registerEmail`, {
        toEmail: txtEmail,
        nombre: txtNombre,
        apellido: txtApellido1,
        validationToken
      });

    cogoToast.success(
      <div>
        <h5>{trans("registerFormClientes.registroCompletado")}</h5>
        <small>
          <b>{trans("registerFormClientes.darGracias")}</b>
        </small>
      </div>
    );
    this.props.changeFormContent("tabla");
  }

  render() {
    return (
      <SocketContext.Consumer>
        {socket => (
          <div className="p-5 d-flex flex-column">
            <div className="d-flex justify-content-center align-items-center mb-2">
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
            <div className="row">
              <div className="col-12 mb-2">
                <div>
                  <FontAwesomeIcon icon={faUser} className="mr-1"/>
                  <label htmlFor="txtNombre">
                    {trans("registerFormClientes.nombre")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                </div>
                
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
                  placeholder={`${i18next.t('registerFormClientes.nombre')}...`}
                  value={this.state.txtNombre}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-12 mb-2">
                <label htmlFor="txtApellido1">
                  {trans("registerFormClientes.apellido1")}
                </label>
                <input
                  onChange={this.handleInputChange}
                  type="text"
                  className="form-control"
                  id="txtApellido1"
                  aria-describedby="txtNombreHelp"
                  placeholder={`${i18next.t('registerFormClientes.apellido1')}...`}
                  value={this.state.txtApellido1}
                />
              </div>
              <div className="col-lg-6 col-12 mb-2">
                <label htmlFor="txtApellido2">
                  {trans("registerFormClientes.apellido2")}
                </label>
                <input
                  onChange={this.handleInputChange}
                  type="text"
                  className="form-control"
                  id="txtApellido2"
                  aria-describedby="txtNombreHelp"
                  placeholder={`${i18next.t('registerFormClientes.apellido2')}...`}
                  value={this.state.txtApellido2}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-12 mb-2">
                <div>
                  <FontAwesomeIcon icon={faAt} className="mr-1" />
                  <label htmlFor="txtEmail">
                    {trans("registerFormClientes.email")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                </div>
                
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
                  placeholder={`${i18next.t('registerFormClientes.email')}...`}
                  value={this.state.txtEmail}
                />
              </div>
              <div className="col-lg-6 col-12 mb-2">
                <div>
                  <FontAwesomeIcon icon={faKey} className="mr-1" />
                  <label htmlFor="txtContrasena">
                    {trans("registerFormClientes.contrasena")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                </div>
                
                <input
                  onChange={this.handleInputChange}
                  type="password"
                  class={
                    this.state.error.txtNombre
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  id="txtContrasena"
                  placeholder={`${i18next.t('registerFormClientes.contrasena')}...`}
                  value={this.state.txtContrasena}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-12 mb-2">
                <div>
                  <FontAwesomeIcon icon={faMobileAlt} className="mr-1" />
                  <label htmlFor="txtMovil">
                   {trans("registerFormClientes.movil")}
                  </label>{" "}
                  (<span className="text-danger font-weight-bold">*</span>)
                </div>
                
                <input
                  onChange={this.handleInputChange}
                  type="number"
                  class={
                    this.state.error.txtNombre
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  id="txtMovil"
                  placeholder={`${i18next.t('registerFormClientes.movil')}...`}
                  value={this.state.txtMovil}
                />
              </div>
              <div className="col-lg-6 col-12 mb-2">
                <div>
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-1" />
                  <label htmlFor="txtFijo">
                    {trans("registerFormClientes.telefFijo")}
                  </label>{" "}
                </div>
                
                <input
                  onChange={this.handleInputChange}
                  type="number"
                  class={
                    this.state.error.txtFijo
                      ? "border border-danger form-control"
                      : "form-control"
                  }
                  id="txtFijo"
                  placeholder={`${i18next.t('registerFormClientes.telefFijo')}...`}
                  value={this.state.txtFijo}
                />
              </div>
            </div>
            <div id="loaderOrButton" className="w-100 mt-5 text-center">
              {this.state.isLoading ? (
                <ClipLoader color="#28a745" />
              ) : (
                <button
                  onClick={() => this.handleRegistrarse(socket)}
                  type="button"
                  className="w-100 btn btn-success "
                >
                  {trans("registerFormClientes.registrarse")}
                </button>
              )}
            </div>
          </div>
        )}
      </SocketContext.Consumer>
    );
  }
}

export default connect(null, mapDispatchToProps)(RegisterFormCliente);
