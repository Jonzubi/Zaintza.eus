import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";

class Tabla extends React.Component {
  componentDidMount() {
    Axios.get("http://" + ipMaquina + ":3001/cuidador").then(data => {
      this.setState({
        jsonCuidadores: data.data
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      jsonCuidadores: {}
    };
  }

  render() {
    return (
      <table className="table">
        <tr className="row">
          {typeof this.state.jsonCuidadores.map != "undefined"
            ? this.state.jsonCuidadores.map((cuidador, indice) => {
                return (
                  <td className="col-3 border-top-0">
                    <div className="card w-20 m-4" style={{ width: "18rem" }}>
                      <img
                        src={"http://" + ipMaquina + ":3001/image/" + cuidador.direcFotoContacto}
                        class="card-img-top"
                        alt="..."
                      />
                      <div className="card-body">
                        <h5 className="card-title mt-2">
                          {cuidador.nombre + " " + cuidador.apellido1}
                        </h5>
                        <p className="card-text">
                          {cuidador.descripcion || " a"}
                        </p>
                        <a href="#" className="mr-0 w-100 btn btn-success">
                          Contactar
                          <FontAwesomeIcon className="ml-1" icon={faPhone} />
                        </a>
                      </div>
                    </div>
                  </td>
                );
              })
            : ""}
        </tr>
      </table>
    );
  }
}

export default Tabla;
