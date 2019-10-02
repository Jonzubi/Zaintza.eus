import React from "react";
import Cabecera from "./components/header";
import MenuPerfil from "./components/menuPerfil";

class App extends React.Component {
  
  render() {
    return (
      <div className="container-fluid">
        <Cabecera />       
      </div>
    );
  }
}

export default App;
