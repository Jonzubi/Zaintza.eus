import React from "react";
import {slide as BurgerMenu} from "react-burger-menu";

class MenuPerfil extends React.Component {
  render() {
    return (
      <BurgerMenu right>
        <button id="home" type="button" className="menu-item" href="#">
          Home
        </button>
        <button id="about" type="button" className="menu-item" href="#">
          About
        </button>
        <button id="contact" type="button" className="menu-item" href="">
          Contact
        </button>
      </BurgerMenu>
    );
  }
}

export default MenuPerfil;
