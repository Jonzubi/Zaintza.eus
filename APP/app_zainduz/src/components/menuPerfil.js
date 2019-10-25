import React from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import Avatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import imgPerfil from "../util/fotosPrueba/image.jpg";
import "./styles/menuPerfil.css";

class MenuPerfil extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogIn: false
    };
  }

  handleLogIn(){
    //TODO Hacer llamada al servidor y loguearte
    console.log("Login");
  }

  handleRegistrar(){
    //TODO Devolver formulario para registrarse
    console.log("Register");
  }

  getAvatar() {
    if (!this.state.isLogIn)
      return (
        <FontAwesomeIcon
          size="10x"
          className="mx-auto pt-3"
          icon={faUserCircle}
          style={{ color: "white" }}
        />
      );
    else
      return (
        <Avatar
          name=""
          src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
          size={250}
          round="125px"
          className="mx-auto pt-3"
        />
      );
  }

  getMenuContent() {
    if (!this.state.isLogIn) {
      //TODO Devolver el formulario de inicio de sesion
      return (
        <form className="mt-5">
          <div>
            <label for="exampleInputEmail1">Email</label>
            <input
              type="email"
              class="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="Insertar email..."
            />
          </div>
          <div class="form-group">
            <label for="exampleInputPassword1">Contraseña</label>
            <input
              type="password"
              class="form-control"
              id="exampleInputPassword1"
              placeholder="Insertar contraseña..."
            />
          </div>
          <div class="form-group form-check">
            <input
              type="checkbox"
              class="form-check-input"
              id="exampleCheck1"
            />
            <label class="form-check-label" for="exampleCheck1">
              Recordarme
            </label>
          </div>
          <div className="btn-group mt-3">
          <button onClick={this.handleLogIn} name="btnLogIn" type="button" class="btn btn-primary">
            Iniciar sesion
          </button>
          <button onClick={this.handleRegistrar} name="btnRegistrar" type="button" class="btn btn-success">
            Registrarse
          </button>
          </div>
        </form>
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
        onStateChange={state => this.props.myHandleStateChange(state)}
        outerContainerId={"outer-container"}
        className=""
        isOpen={this.props.myIsOpenMenuPerfil}
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

export default MenuPerfil;
