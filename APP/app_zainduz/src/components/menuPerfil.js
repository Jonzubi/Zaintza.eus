import React from "react";
import {slide as BurgerMenu} from "react-burger-menu";

class MenuPerfil extends React.Component {
  render() {
    return (
      <BurgerMenu right>
        <a id="home" className="menu-item" href="/">
          Home
        </a>
        <a id="about" className="menu-item" href="/about">
          About
        </a>
        <a id="contact" className="menu-item" href="/contact">
          Contact
        </a>
      </BurgerMenu>
    );
  }
}

export default MenuPerfil;
