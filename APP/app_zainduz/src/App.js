import React from "react";
import axios from "axios";
const ipMaquina = require("./util/ipMaquina");
const cabecera = require("./util/headerAxios");

class App extends React.Component {
  state = {
    respuesta: "No especificado",
    hecho: false
  };

  componentDidMount(){
    axios({
      method: "POST",
      url: 'http://' + ipMaquina + ':3001/insertRow/cuidador',
      headers: cabecera,
      data: {
        nombre: "Antonio"
      }
    }).then(res => {
        this.setState({
          respuesta: res.data,
          hecho: true
        });
    }).catch(err => {
        this.setState({ respuesta: err.message, hecho: "ERROR" });
    });
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
