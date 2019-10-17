import React from "react";
import {slide as BurgerMenu} from "react-burger-menu";
import Avatar from 'react-avatar';
import imgPerfil from "../util/fotosPrueba/image.jpg";

class MenuPerfil extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isOpened : false
    }
  }

  //Abre o cierra el menu segun el estado actual
  toggleMenu () {
    this.setState(state => ({menuOpen: !state.menuOpen}))
  }

  render() {
    return (
      <BurgerMenu
          customBurgerIcon={false}
          customCrossIcon={<FontAwesomeIcon icon={faTimes} />}
          onStateChange={state => this.handleStateChange(state)}
          outerContainerId={"outer-container"}
          className="bg-dark"
          isOpen={this.state.isOpenMenuPerfil}
          pageWrapId={"headRoom"}
          right
        >
          <Avatar
            name=""
            src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
            size={250}
            round="125px"
            className="mx-auto pt-3"
          />
          <div
            id="menu-perfil-opciones"
            className="container-fluid mt-5 btn-group-vertical"
          >
            <button
              id="home"
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Calendario
            </button>
            <button
              id="about"
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Contratos
            </button>
            <button
              id="contact"
              type="button"
              className="w-100 btn btn-secondary"
              href=""
            >
              Salir
            </button>
          </div>
        </BurgerMenu>
    );
  }
}

export default MenuPerfil;
