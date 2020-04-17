import React from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import Avatar from "react-avatar";
import LogInForm from "./logInForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import imgPerfil from "../util/fotosPrueba/image.jpg";
import { connect } from "react-redux";
import { toogleMenuPerfil } from "../redux/actions/menuPerfil";
import { initializeUserSession } from "../redux/actions/user";
import { changeFormContent } from "../redux/actions/app";
import ipMaquina from "../util/ipMaquinaAPI";
import "./styles/menuPerfil.css";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import Axios from "axios";
import ChangeLang from "../components/changeLang";
import SocketContext from "../socketio/socket-context";
import { setCountNotify } from "../redux/actions/notifications";

const mapStateToProps = state => {
  return {
    isOpened: state.menuPerfil.isOpened,
    direcFoto: state.user.direcFoto,
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario,
    nombre: state.user.nombre,
    apellido1: state.user.apellido1,
    countNotifies: state.notification.countNotifies,
    email: state.user.email,
    contrasena: state.user.contrasena
  };
};

let gSocket = null;
let notifyReceiving = false;

const mapDispatchToProps = dispatch => {
  return {
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload)),
    initializeUserSession: () => dispatch(initializeUserSession()),
    changeFormContent: form => dispatch(changeFormContent(form)),
    setCountNotify: payload => dispatch(setCountNotify(payload))
  };
};

class MenuPerfil extends React.Component {
  handleNotifyReceived = () => {
    const { countNotifies, setCountNotify, idUsuario, email, contrasena } = this.props;
    //Si no esta logueado no queremos saber notificaciones;
    if (
      typeof this.props.idUsuario == "undefined" ||
      this.props.idUsuario == ""
    )
      return;

    Axios.post(`http://${ipMaquina}:3001/api/procedures/getNotificationsWithIdUsuario/${idUsuario}`, {
      email,
      contrasena
    }).then(resultado => {
      if (resultado.data != "Vacio" && countNotifies != resultado.data.length) {
        setCountNotify(resultado.data.length);
        cogoToast.info(<h5>{trans("menuPerfil.notificacionRecibida")}</h5>);
      } else if (resultado.data == "Vacio" && countNotifies != 0) {
        setCountNotify(0);
      }
    });
  };
  constructor(props) {
    super(props);

    this.handleClickPerfil = this.handleClickPerfil.bind(this);
    this.handleClickAcuerdos = this.handleClickAcuerdos.bind(this);
    this.handleClickNotificaciones = this.handleClickNotificaciones.bind(this);
    this.handleClickAjustes = this.handleClickAjustes.bind(this);
  }

  getAvatar() {
    return this.props.direcFoto == "" ? (
      <FontAwesomeIcon
        size="10x"
        className="mx-auto"
        icon={faUserCircle}
        style={{ color: "white" }}
      />
    ) : (
      <Avatar
        name={this.props.nombre + " " + this.props.apellido1 || ""}
        src={"http://" + ipMaquina + ":3001/api/image/" + this.props.direcFoto}
        className="mx-auto"
        round={true}
        size="200"
      />
    );
  }

  handleClickPerfil() {
    const tipoUsuario = this.props.tipoUsuario;

    switch (tipoUsuario) {
      case "Cuidador":
        this.props.changeFormContent("perfilCuidador");
        break;
      case "Cliente":
        this.props.changeFormContent("perfilCliente");
        break;
      default:
        this.props.changeFormContent("tabla");
    }

    this.props.toogleMenuPerfil(false);
  }

  handleClickAcuerdos() {
    this.props.changeFormContent("acuerdos");
    this.props.toogleMenuPerfil(false);
  }

  handleClickNotificaciones() {
    this.props.changeFormContent("notificaciones");
    this.props.toogleMenuPerfil(false);
  }

  handleLogOut() {
    const { idUsuario } = this.props;

    this.props.initializeUserSession();
    this.props.changeFormContent("tabla");
    this.props.toogleMenuPerfil(false);
    gSocket.emit("logout", {
      idUsuario: idUsuario
    });
    cogoToast.success(<h5>{trans("notificaciones.sesionCerrada")}</h5>);
  }

  handleClickCalendario() {
    this.props.changeFormContent("calendario");
    this.props.toogleMenuPerfil(false);
  }

  handleClickAjustes() {
    this.props.changeFormContent("ajustes");
    this.props.toogleMenuPerfil(false);
  }

  getMenuContent() {
    if (!this.props.tipoUsuario) {
      return <LogInForm />;
    } else {
      return (
        <SocketContext.Consumer>
          {socket => {
            gSocket = socket;
            if (!notifyReceiving) {
              socket.on("notifyReceived", this.handleNotifyReceived);
              notifyReceiving = true;
            }
            const { countNotifies } = this.props;

            return (
              <div id="menu-perfil-content" className="w-100">
                <div
                  id="menu-perfil-opciones"
                  className="btn-group-vertical w-100 mt-5"
                >
                  <button
                    type="button"
                    className="w-100 btn btn-secondary"
                    onClick={() => this.handleClickPerfil()}
                  >
                    {trans("menuPerfil.perfil")}
                  </button>
                  <button
                    type="button"
                    className="w-100 btn btn-secondary"
                    onClick={() => this.handleClickCalendario()}
                  >
                    {trans("menuPerfil.calendario")}
                  </button>
                  <button
                    type="button"
                    className="w-100 btn btn-secondary"
                    onClick={() => this.handleClickAcuerdos()}
                  >
                    {trans("menuPerfil.contratos")}
                  </button>
                  <button
                    type="button"
                    className="w-100 btn btn-secondary"
                    onClick={() => this.handleClickNotificaciones()}
                  >
                    {trans("menuPerfil.notificaciones")}
                    {countNotifies > 0 ? (
                      <span className="badge badge-light ml-2">
                        {countNotifies}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className="w-100 btn btn-secondary"
                    onClick={() => this.handleClickAjustes()}
                  >
                    {trans("menuPerfil.ajustes")}
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-5 w-100 btn btn-danger"
                  onClick={() => this.handleLogOut()}
                >
                  <FontAwesomeIcon className="mt-1 float-left" icon={faTimes} />
                  {trans("menuPerfil.salir")}
                </button>
              </div>
            );
          }}
        </SocketContext.Consumer>
      );
    }
  }

  render() {
    const IconAvatar = this.getAvatar.bind(this);
    const MenuContent = this.getMenuContent.bind(this);
    return (
      <BurgerMenu
        customBurgerIcon={false}
        customCrossIcon={
          <FontAwesomeIcon
            className="bg-transparent text-light"
            icon={faTimes}
          />
        }
        outerContainerId={"outer-container"}
        onStateChange={state => {
          this.props.toogleMenuPerfil(state.isOpen);
        }}
        className="text-center"
        isOpen={this.props.isOpened}
        pageWrapId={"outer-container"}
        right
        styles={{ background: "#343a40" }}
      >
        <div style={{
          outline: "none"
        }} className="d-flex flex-column justify-content-between h-100">
          <IconAvatar />
          <MenuContent />
          <div className="d-none d-sm-inline">
            <ChangeLang />
          </div>          
        </div>
      </BurgerMenu>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuPerfil);
