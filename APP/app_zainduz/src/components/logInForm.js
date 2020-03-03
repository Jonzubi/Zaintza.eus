import React from "react";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import { changeFormContent } from "../redux/actions/app";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { saveUserSession } from "../redux/actions/user";
import { toogleModal } from "../redux/actions/modalRegistrarse";
import { trans } from "../util/funciones";
import i18n from "i18next";
import {translate} from "react-i18next";

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form)),
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload)),
    saveUserSession: user => dispatch(saveUserSession(user)),
    toogleModal: payload => dispatch(toogleModal(payload))
  };
};

class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtEmail: window.localStorage.getItem("nombreUsuario") || "",
      txtContrasena: window.localStorage.getItem("password") || "",
      chkRecordarme:
        window.localStorage.getItem("nombreUsuario") != null ? true : false,
      objUsuario: {},
      isLoading: false
    };

    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async handleLogIn() {
    const vEmail = this.state.txtEmail;
    const vContrasena = this.state.txtContrasena;
    var objFiltros = {
      email: vEmail,
      contrasena: vContrasena
    };

    this.setState(
      {
        isLoading: true
      },
      () => {
        axios
          .get("http://" + ipMaquina + ":3001/api/procedures/getUsuarioConPerfil", {
            params: objFiltros
          })
          .then(resultado => {
            if(resultado.data !== "Vacio") {
              const usuario = resultado.data.idUsuario;
              const idPerfil = usuario.idPerfil._id;
              const idUsuario = usuario._id;

              this.props.saveUserSession(Object.assign({}, usuario.idPerfil, {
                _id: idPerfil,
                _idUsuario: idUsuario,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario,
                contrasena: usuario.contrasena,
                idLangPred: resultado.data.idLangPred
              }));

              if (this.state.chkRecordarme) {
                window.localStorage.setItem("nombreUsuario", vEmail);
                window.localStorage.setItem("password", vContrasena);
              } else {
                window.localStorage.removeItem("nombreUsuario");
                window.localStorage.removeItem("password");
              }

              i18n.changeLanguage(resultado.data.idLangPred);

              this.props.toogleMenuPerfil(false);
              cogoToast.success(
                <h5>{trans("notificaciones.sesionIniciada")}</h5>
              );
              this.setState({
                isLoading: false
              });
            }
            else {
              cogoToast.error(<h5>{trans("notificaciones.datosIncorrectos")}</h5>);
              this.setState({
                isLoading: false
              });
            }
          })
          .catch(err => {
            console.log(err);
            cogoToast.error(<h5>{trans("notificaciones.errorConexion")}</h5>);
            this.setState({
              isLoading: false
            });
          });        
      }
    );
  }

  handleInputChange(e) {
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value
    });
  }

  toogleChkRecordarme() {
    const aux = !this.state.chkRecordarme;
    this.setState({
      chkRecordarme: aux
    });
  }

  render() {
    return (
      <form className="mt-5">
        <div>
          <label htmlFor="txtEmail">{trans("loginForm.email")}</label>
          
          <input
            onChange={this.handleInputChange}
            type="email"
            className="form-control"
            id="txtEmail"
            aria-describedby="emailHelp"
            placeholder={i18n.t('loginForm.insertEmail')}
            value={this.state.txtEmail}
          />
          
        </div>
        <div className="form-group">
          <label htmlFor="txtContrasena">{trans("loginForm.contrasena")}</label>
          <input
            onChange={this.handleInputChange}
            type="password"
            className="form-control"
            id="txtContrasena"
            placeholder={"Pasahitza..."}
            value={this.state.txtContrasena}
          />
        </div>
        <div className="form-group form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="chkRecordarme"
            checked={this.state.chkRecordarme}
            onChange={() => this.toogleChkRecordarme()}
          />
          <label className="form-check-label" htmlFor="chkRecordarme">
            {trans("loginForm.recordarme")}
          </label>
        </div>
        {this.state.isLoading ? (
          <div className="row mt-3 justify-content-center">
            <img src={"http://" + ipMaquina + ":3001/api/image/loadGif"} height={50} width={50} />
          </div>
        ) : (
          <div className="row mt-3">
            <button
              onClick={() => this.handleLogIn()}
              name="btnLogIn"
              type="button"
              className="btn btn-light col-5"
            >
              {trans("loginForm.iniciarSesion")}
            </button>
            <div className="col-2"></div>
            <button
              onClick={() => {
                this.props.toogleModal(true);
                this.props.toogleMenuPerfil(false);
              }}
              name="btnRegistrar"
              type="button"
              className="btn btn-success col-5"
            >
              {trans("loginForm.registrarse")}
            </button>
          </div>
        )}
      </form>
    );
  }
}

export default connect(null, mapDispatchToProps)(LogInForm);
