import React from "react";
import Cabecera from "./components/header";
import MenuPerfil from "./components/menuPerfil";

class App extends React.Component {
  
  render() {
    return (
      <div style={{height:2000}} className="container-fluid">
        <MenuPerfil pageWrapId={"cabecera"}/>
        <Cabecera id="cabecera" />
      </div>
    );
  }
}

export default App;
