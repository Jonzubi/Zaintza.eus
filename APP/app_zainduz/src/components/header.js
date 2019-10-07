import React from "react";
import Headroom from "react-headroom";
import MenuPerfil from "../components/menuPerfil"

class Header extends React.Component {
  render() {
    return (      
      <Headroom style={{background:"green"}}>
        <h1>Zainduz</h1>
      </Headroom>
    );
  }
}

export default Header;
