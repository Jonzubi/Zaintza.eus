import React from "react";
import axios from "axios";
const ipMaquina = require("./util/ipMaquina");
const cabecera = require("./util/headerAxios");

class App extends React.Component {
  state = {
    respuesta: "No especificado",
    hecho: "Hola mudno"
  };

  componentDidMount(){
    
  }

  render() {
    return (
      <div>
        <h1>{this.state.hecho.toString()}</h1>
        <b>{this.state.respuesta}</b>
      </div>
    );
  }
}

export default App;
