import React from "react";
import axios from "../util/axiosInstance";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { connect } from "react-redux";
import { changeFormContent, changeLang } from "../redux/actions/app";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { saveUserSession } from "../redux/actions/user";
import { toogleModal } from "../redux/actions/modalRegistrarse";
import { trans } from "../util/funciones";
import moment from 'moment';
import i18n from "i18next";
import SocketContext from "../socketio/socket-context";
import ClipLoader from "react-spinners/ClipLoader";
import i18next from "i18next";
import { SetMaxDistance } from "../redux/actions/coords";

const mapDispatchToProps = (dispatch) => {
  return {
    changeFormContent: (form) => dispatch(changeFormContent(form)),
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
    saveUserSession: (user) => dispatch(saveUserSession(user)),
    toogleModal: (payload) => dispatch(toogleModal(payload)),
    changeLang: (payload) => dispatch(changeLang(payload)),
    setMaxDistance: (payload) => dispatch(SetMaxDistance(payload)),
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
      isLoading: false,
    };

    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async handleLogIn(socket) {
    console.log(socket);
    const { changeLang, setMaxDistance, changeFormContent } = this.props;
    const vEmail = this.state.txtEmail;
    const vContrasena = this.state.txtContrasena;
    var objFiltros = {
      email: vEmail,
      contrasena: vContrasena,
    };

    this.setState(
      {
        isLoading: true,
      },
      () => {
        axios
          .get(
            "https://" + ipMaquina + ":3001/api/procedures/getUsuarioConPerfil",
            {
              params: objFiltros,
            }
          )
          .then((resultado) => {
            if (resultado.data !== "Vacio") {
              //usuario se define de dos formas porque el usuario puede tener ajustes o no configurados
              //Entonces de la API viene de 2 formas
              const usuario = resultado.data.idUsuario || resultado.data;
              const idPerfil = usuario.idPerfil._id;
              const idUsuario = usuario._id;

              if (usuario.validado == false) {
                cogoToast.error(<h5>{trans("loginForm.validarEmail")}</h5>);
                this.setState({
                  isLoading: false,
                });
                return;
              }

              this.props.saveUserSession(
                Object.assign({}, usuario.idPerfil, {
                  _id: idPerfil,
                  _idUsuario: idUsuario,
                  email: usuario.email,
                  tipoUsuario: usuario.tipoUsuario,
                  contrasena: usuario.contrasena,
                  idLangPred: resultado.data.idLangPred || "",
                })
              );

              if (this.state.chkRecordarme) {
                window.localStorage.setItem("nombreUsuario", vEmail);
                window.localStorage.setItem("password", vContrasena);
              } else {
                window.localStorage.removeItem("nombreUsuario");
                window.localStorage.removeItem("password");
              }

              if (resultado.data.idLangPred !== undefined) {
                i18n.changeLanguage(resultado.data.idLangPred);
                changeLang(resultado.data.idLangPred);
              }

              if (resultado.data.maxDistance !== undefined) {
                setMaxDistance(resultado.data.maxDistance);
              }

              socket.emit("login", {
                idUsuario: idUsuario,
              });

              this.props.toogleMenuPerfil(false);
              changeFormContent('tabla');
              cogoToast.success(
                <h5>{trans("notificaciones.sesionIniciada")}</h5>
              );
              this.setState({
                isLoading: false,
              });
            } else {
              cogoToast.error(
                <h5>{trans("notificaciones.datosIncorrectos")}</h5>
              );
              this.setState({
                isLoading: false,
              });
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              const { bannedUntilDate } = err.response.data;
              cogoToast.error(
                <h5>{i18next.t('notificaciones.baneado', {
                  fecha: moment(bannedUntilDate).format('YYYY-MM-DD')
                })}</h5>
              );
              this.setState({
                isLoading: false,
              });
              return;
            }
            cogoToast.error(<h5>{trans("notificaciones.errorConexion")}</h5>);
            this.setState({
              isLoading: false,
            });
          });
      }
    );
  }

  handleInputChange(e) {
    var stateId = e.target.id;
    this.setState({
      [stateId]: e.target.value,
    });
  }

  toogleChkRecordarme() {
    const aux = !this.state.chkRecordarme;
    this.setState({
      chkRecordarme: aux,
    });
  }

  handleKeyDown = (e) => {
    if (e.key === "Enter") {
      this.handleLogIn(this.socket);
    }
  };

  render() {
    return (
      <SocketContext.Consumer>
        {(socket) => {
          this.socket = socket;
          return (
            <form className="">
              <div>
                <label htmlFor="txtEmail">{trans("loginForm.email")}</label>

                <input
                  onKeyDown={this.handleKeyDown}
                  onChange={this.handleInputChange}
                  type="email"
                  className="form-control"
                  id="txtEmail"
                  aria-describedby="emailHelp"
                  placeholder={i18next.t("loginForm.insertEmail")}
                  value={this.state.txtEmail}
                />
              </div>
              <div className="form-group">
                <label htmlFor="txtContrasena">
                  {trans("loginForm.contrasena")}
                </label>
                <input
                  onKeyDown={this.handleKeyDown}
                  onChange={this.handleInputChange}
                  type="password"
                  className="form-control"
                  id="txtContrasena"
                  placeholder={i18next.t("loginForm.holderContrasena")}
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
                <ClipLoader color="#28a745" />
              ) : (
                <div className="d-flex align-items-center justify-content-between mt-3">
                  <button
                    onClick={() => this.handleLogIn(socket)}
                    name="btnLogIn"
                    type="button"
                    className="btn btn-light flex-fill"
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
                    className="btn btn-success flex-fill"
                  >
                    {trans("loginForm.registrarse")}
                  </button>
                </div>
              )}
            </form>
          );
        }}
      </SocketContext.Consumer>
    );
  }
}

const mapStateToProps = (state) => ({
  nowLang: state.app.nowLang,
});

export default connect(mapStateToProps, mapDispatchToProps)(LogInForm);
