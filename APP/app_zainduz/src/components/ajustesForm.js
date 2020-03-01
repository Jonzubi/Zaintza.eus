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
      txtRepeatNewPassword: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
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
  render() {
    const { txtActualPassword, txtNewPassword, txtRepeatNewPassword} = this.state;
    return (
      <div className="p-5">
        <div className="row">
          <ul className="nav flex-column col-3">
            <li className="nav-item">
              <div className="nav-link btn btn-success">Perfil</div>
            </li>
          </ul>
          <div className="col-9 flex-column">
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
