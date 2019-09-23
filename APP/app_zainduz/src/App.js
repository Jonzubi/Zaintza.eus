import React from "react";
import axios from "axios";
const ipMaquina = require("./util/ipMaquina");

class App extends React.Component {
  state = {
    respuesta: [],
    hecho: false
  };

  componentDidMount() {
    const json = {
      idCuidador: 1,
      nombre: "Iraitz"
    };

    console.log(ipMaquina);

    axios
      .get("http://" + ipMaquina + ":3001/Inicio", { headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*', } })
      .then(res => {
        this.setState({
          respuesta: res.data,
          hecho: true
        });
      })
      .catch(err => {
        this.setState({ respuesta: err, hecho: "ERROR" });
      });
  }

  render() {
    return <h1>{this.state.hecho.toString()}</h1>;
  }
}

export default App;
