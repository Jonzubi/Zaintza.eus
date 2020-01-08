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
import { t } from "../util/funciones";
import Axios from "axios";

const mapStateToProps = state => {
  return {
    isOpened: state.menuPerfil.isOpened,
    direcFoto: state.user.direcFoto,
    tipoUsuario: state.user.tipoUsuario,
    idPerfil: state.user._id,
    idUsuario: state.user._idUsuario
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toogleMenuPerfil: payload => dispatch(toogleMenuPerfil(payload)),
    initializeUserSession: () => dispatch(initializeUserSession()),
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

class MenuPerfil extends React.Component {
  componentDidMount() {
    setInterval(() => {
      Axios.get("http://" + ipMaquina + ":3001/notificacion", {
        params: {
          filtros: {
            idUsuario: this.props.idUsuario,
            visto: false
          }
        }
      }).then(resultado => {
        if (
          resultado.data != "Vacio" &&
          this.state.countNotificaciones != resultado.data.length
        ) {
          this.setState({
            countNotificaciones: resultado.data.length
          });
        } else if (
          resultado.data == "Vacio" &&
          this.state.countNotificaciones != 0
        ) {
          this.setState({
            countNotificaciones: 0
          });
        }
      });
    }, 5000);
  }
  constructor(props) {
    super(props);

    this.state = {
      countNotificaciones: 0
    };

    this.handleClickPerfil = this.handleClickPerfil.bind(this);
    this.handleClickAcuerdos = this.handleClickAcuerdos.bind(this);
    this.handleClickNotificaciones = this.handleClickNotificaciones.bind(this);
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
        name={this.props.nombre + " " + this.props.apellido1}
        src={"http://" + ipMaquina + ":3001/image/" + this.props.direcFoto}
        className="mx-auto"
        round={true}
        size="200"
      />
    );
  }

  handleClickPerfil() {
    const tipoUsuario = this.props.tipoUsuario;

    switch (tipoUsuario) {
      case "Z":
        this.props.changeFormContent("perfilCuidador");
        break;
      case "C":
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
    this.props.initializeUserSession();
    this.props.changeFormContent("tabla");
    this.props.toogleMenuPerfil(false);
    cogoToast.success(<h5>{t("notificaciones.sesionCerrada")}</h5>);
  }

  getMenuContent() {
    if (!this.props.tipoUsuario) {
      return <LogInForm />;
    } else {
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
              {t("menuPerfil.perfil")}
            </button>
            <button type="button" className="w-100 btn btn-secondary">
              {t("menuPerfil.calendario")}
            </button>
            <button
              type="button"
              className="w-100 btn btn-secondary"
              onClick={() => this.handleClickAcuerdos()}
            >
              {t("menuPerfil.contratos")}
            </button>
            <button
              type="button"
              className="w-100 btn btn-secondary"
              onClick={() => this.handleClickNotificaciones()}
            >
              {t("menuPerfil.notificaciones")}
              {this.state.countNotificaciones > 0 ? (
                <span className="badge badge-light ml-2">
                  {this.state.countNotificaciones}
                </span>
              ) : null}
            </button>
            <button type="button" className="w-100 btn btn-secondary">
              {t("menuPerfil.ajustes")}
            </button>
          </div>
          <button
            type="button"
            className="mt-5 w-100 btn btn-danger"
            onClick={() => this.handleLogOut()}
          >
            <FontAwesomeIcon className="mt-1 float-left" icon={faTimes} />
            {t("menuPerfil.salir")}
          </button>
        </div>
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
        <IconAvatar />
        <MenuContent />
      </BurgerMenu>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuPerfil);
