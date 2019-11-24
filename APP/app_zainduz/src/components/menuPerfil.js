import React from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import Avatar from "react-avatar";
import LogInForm from "./logInForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import imgPerfil from "../util/fotosPrueba/image.jpg";
import {connect} from "react-redux";
import {toogleMenuPerfil} from "../redux/actions/menuPerfil";
import "./styles/menuPerfil.css";

const mapStateToProps = state => {
  return {isOpened: state.menuPerfil.isOpened}
}

const mapDispatchToProps = dispatch => {
  return {toogleMenuPerfil: (payload) => dispatch(toogleMenuPerfil(payload))}
}

class MenuPerfil extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogIn:false
    }
  }

  getAvatar() {  
    return (
      <FontAwesomeIcon
        size="10x"
        className="mx-auto pt-3"
        icon={faUserCircle}
        style={{ color: "white" }}
      />
    );  
  }

  getMenuContent() {
    if (!this.state.isLogIn) {
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
          <button type="button" className="mt-5 w-100 btn btn-danger">
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
        customCrossIcon={<FontAwesomeIcon icon={faTimes} />}
        outerContainerId={"outer-container"}
        onStateChange={(state) => {this.props.toogleMenuPerfil(state.isOpen)}}
        className=""
        isOpen={this.props.isOpened}
        pageWrapId={"headRoom"}
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
