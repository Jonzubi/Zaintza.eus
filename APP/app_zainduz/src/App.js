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
      method: "PATCH",
      url: 'http://' + ipMaquina + ':3001/updateRow/cuidador/5d935550bb3b770558c2510b',
      headers: cabecera,
      data: {
        nombre: "Antonius"
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
