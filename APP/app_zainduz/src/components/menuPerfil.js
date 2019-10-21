import React from "react";
import {slide as BurgerMenu} from "react-burger-menu";
import Avatar from 'react-avatar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import imgPerfil from "../util/fotosPrueba/image.jpg";
import "./styles/menuPerfil.css";

class MenuPerfil extends React.Component {
  render() {
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
          styles={{background:"#343a40"}}
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
            className="w-100 mt-5 btn-group-vertical"
          >
            <button
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Calendario
            </button>
            <button
              type="button"
              className="w-100 btn btn-secondary"
              href="#"
            >
              Contratos
            </button>            
          </div>
          <button
              type="button"
              className="mt-5 w-100 btn btn-danger"
              href=""
            >
              <FontAwesomeIcon className="mt-1 float-left" icon={faTimes} />
              Salir
            </button>
        </BurgerMenu>
    );
  }
}

export default MenuPerfil;
