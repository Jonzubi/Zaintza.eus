import React from "react";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import Axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import { saveUserSession } from "../redux/actions/user";
import { trans, getRandomString } from "../util/funciones";

class AjustesForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      txtActualPassword: "",
      txtNewPassword: "",
      txtRepeatNewPassword: "",
      formChosen: "perfil"
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeFormChosen = this.handleChangeFormChosen.bind(this);
  }
  handleChangePassword() {
    const {
      txtNewPassword,
      txtRepeatNewPassword,
      txtActualPassword
    } = this.state;
    const { contrasena, idUsuario, saveUserSession } = this.props;

    if (contrasena !== txtActualPassword) {
      cogoToast.error(<h5>La contraseña actual no coincide</h5>);
      return;
    }

    if (txtNewPassword !== txtRepeatNewPassword) {
      cogoToast.error(<h5>Las nuevas contraseñas no coinciden</h5>);
      return;
    }

    const formData = {
      contrasena: txtNewPassword
    };

    Axios.patch(
      "http://" + ipMaquina + ":3001/api/usuario/" + idUsuario,
      formData
    )
      .then(() => {
        saveUserSession(formData);
        cogoToast.success(<h5>{trans("perfilCliente.datosActualizados")}</h5>);
        this.setState({
          txtActualPassword: "",
          txtNewPassword: "",
          txtRepeatNewPassword: ""
        });
      })
      .catch(() => {
        cogoToast.error(<h5>{trans("perfilCliente.errorGeneral")}</h5>);
      });
  }

  handleInputChange(e) {
    const stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  handleChangeFormChosen(form) {
    this.setState({
      formChosen: form
    });
  }
  render() {
    const {
      txtActualPassword,
      txtNewPassword,
      txtRepeatNewPassword,
      formChosen
    } = this.state;
    return (
      <div className="p-5">
        <div className="row">
          <div className="col-3">
            <div
              className={formChosen !== "perfil" ? "btn" : "btn btn-success"}
              onClick={() => this.handleChangeFormChosen("perfil")}
            >
              Perfil
            </div>
            <br />
            <div
              className={formChosen !== "idioma" ? "btn" : "btn btn-success"}
              onClick={() => this.handleChangeFormChosen("idioma")}
            >
              Idioma
            </div>
            <br />
            <div
              className={formChosen !== "app" ? "btn" : "btn btn-success"}
              onClick={() => this.handleChangeFormChosen("app")}
            >
              Ajustes de la aplicacion
            </div>
          </div>
          <div
            className={formChosen === "perfil" ? "col-9 flex-column" : "d-none"}
          >
            <h1>Perfil</h1>
            <hr />
            <h5>Contraseña</h5>
            <hr />
            <div className="">
              <div className="row">
                <span className="col-3">Contraseña actual:</span>
                <input
                  placeholder="Contraseña actual"
                  id="txtActualPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtActualPassword}
                />
              </div>
              <br />
              <br />
              <div className="row">
                <span className="col-3">Nueva contraseña:</span>
                <input
                  placeholder="Nueva contraseña"
                  id="txtNewPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtNewPassword}
                />
              </div>
              <br />
              <br />
              <div className="row">
                <span className="col-3">Repetir nueva contraseña:</span>
                <input
                  placeholder="Repetir nueva contraseña"
                  id="txtRepeatNewPassword"
                  type="password"
                  className="col-9"
                  onChange={this.handleInputChange}
                  value={txtRepeatNewPassword}
                />
              </div>
              <br />
              <div className="d-flex justify-content-end">
                <div
                  className="btn btn-success"
                  onClick={() => this.handleChangePassword()}
                >
                  Cambiar contraseña
                </div>
              </div>
              <hr />
            </div>
          </div>
          <div
            className={formChosen === "idioma" ? "col-9 flex-column" : "d-none"}
          >
            <h1>Idioma</h1>
            <hr />
            <h5>Idioma predeterminado</h5>
            <hr />
          </div>
          <div
            className={formChosen === "app" ? "col-9 flex-column" : "d-none"}
          >
            <h1>Ajustes de la aplicacion</h1>
            <hr />
            <h5>Cantidad de acuerdos a la vez</h5>
            <hr />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  contrasena: state.user.contrasena,
  idUsuario: state.user._idUsuario
});

const mapDispatchToProps = dispatch => ({
  saveUserSession: payload => dispatch(saveUserSession(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(AjustesForm);
