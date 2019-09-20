import React from "react";
import axios from "axios";
const ipMaquina = require("./util/ipMaquina");

class App extends React.Component {
  
  state = {
    respuesta : [],
    hecho : false
  }

  componentDidMount(){
    const json = {
      idCuidador: 1,
      nombre: "Iraitz"
    }; 
    
    axios.post("http://" + ipMaquina + ":3001/insertRow/cuidador" , json)
      .then(res => {
        this.setState(
          { 
            respuesta : res.data , hecho : true
          }
        )
      });
  }

  render() {    
    return (
      <h1>{this.state.hecho}</h1>
    );
  };
}

export default App;
