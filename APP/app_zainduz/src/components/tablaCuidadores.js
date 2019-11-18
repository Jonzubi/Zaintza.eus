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
        <tr className="row" scope="row">
          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>
        </tr>

        <tr className="row" scope="row">
          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>

          <td className="col-3">
            <div className="card w-20 m-4" style={{ width: "18rem" }}>
              <img
                src="https://scontent-sea1-1.cdninstagram.com/vp/5eed5e235373aa8292b4ad220a3a388c/5E34F02F/t51.2885-15/e35/51132313_441179589754437_7832601837240715709_n.jpg?_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_cat=109&ig_cache_key=MTk4NDQwMjIyODMwNTEzNzYyMA%3D%3D.2"
                class="card-img-top"
                alt="..."
              />
              <div className="card-body">
                <h5 className="card-title mt-2">Telmo Lizancos - NIÑOOS</h5>
                <p className="card-text">
                  Hola, soy un puto pederasta y me gusta violar
                </p>
                <a href="#" className="mr-0 w-100 btn btn-success">
                  Contactar
                  <FontAwesomeIcon className="ml-1" icon={faPhone} />
                </a>
              </div>
            </div>
          </td>
        </tr>
      </table>
    );
  }
}

export default Tabla;
