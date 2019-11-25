import React from "react";
import { fallDown as BurgerMenu } from "react-burger-menu";
import Avatar from "react-avatar";
import LogInForm from "./logInForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import imgPerfil from "../util/fotosPrueba/image.jpg";
import {connect} from "react-redux";
import {toogleMenuPerfil} from "../redux/actions/menuPerfil";
import {initializeUserSession} from "../redux/actions/user";
import ipMaquina from "../util/ipMaquinaAPI";
import "./styles/menuPerfil.css";
import cogoToast from "cogo-toast";

const mapStateToProps = state => {
  return {
    isOpened: state.menuPerfil.isOpened,
    direcFoto : state.user.direcFoto
  }
}

const mapDispatchToProps = dispatch => {
  return {
    toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload)),
    initializeUserSession: () => dispatch(initializeUserSession())
  }
}

class MenuPerfil extends React.Component {
  constructor(props) {
    super(props);
  }

  getAvatar() {  
    return (
      this.props.direcFoto == "" ?
      <FontAwesomeIcon
        size="10x"
        className="mx-auto"
        icon={faUserCircle}
        style={{ color: "white" }}
      />
      :
      <Avatar name={this.props.nombre + " " + this.props.apellido1} src={"http://" + ipMaquina + ":3001/image/" + this.props.direcFoto} 
              className="mx-auto"
              round={true}
              size="200"
      />
    );  
  }

  handleLogOut(){
    this.props.initializeUserSession();
    this.props.toogleMenuPerfil(false);
    cogoToast.success(
      <h5>Sesion cerrada correctamente!</h5>
    )
  }

  getMenuContent() {
    if (!this.props.direcFoto) {
      //TODO Devolver el formulario de inicio de sesion
      return (
        <LogInForm />
      );
    } else {
      //TODO Devolver el menu que va a tener la aplicacion
      return (
        <div id="menu-perfil-content" className="w-100">
          <div
            id="menu-perfil-opciones"
            className="btn-group-vertical w-100 mt-5"            
          >
            <button type="button" className="w-100 btn btn-secondary ">
              Calendario
            </button>
            <button type="button" className="w-100 btn btn-secondary">
              Contratos
            </button>
          </div>
          <button type="button" className="mt-5 w-100 btn btn-danger" onClick={() => this.handleLogOut()}>
            <FontAwesomeIcon className="mt-1 float-left" icon={faTimes} />
            Salir
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
        customCrossIcon={<FontAwesomeIcon className="bg-transparent text-light" icon={faTimes} />}
        outerContainerId={"outer-container"}
        onStateChange={(state) => {this.props.toogleMenuPerfil(state.isOpen)}}
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

export default connect(mapStateToProps,mapDispatchToProps)(MenuPerfil);
