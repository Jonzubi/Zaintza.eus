import React from "react";
import MenuPerfil from "./components/menuPerfil";
import Cabecera from "./components/header";
import Tabla from "./components/tabla";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenuPerfil: false
    };
  }
  handleStateChange(state) {
    this.setState({ isOpenMenuPerfil: state.isOpen });
  }

  //Abre o cierra el menu segun el estado actual
  toggleMenu() {
    this.setState(state => ({ isOpenMenuPerfil: !state.isOpenMenuPerfil }));
  }

  render() {
    return (
      <div id="outer-container" style={{ height:3000 }} className="w-100">
        <MenuPerfil myIsOpenMenuPerfil={this.state.isOpenMenuPerfil} myHandleStateChange={this.handleStateChange.bind(this)} />
        <Cabecera myToogleMenu= {this.toggleMenu.bind(this)} />
        <Tabla />
      </div>
    );
  }
}

export default App;
