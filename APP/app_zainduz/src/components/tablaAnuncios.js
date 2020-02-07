import React from "react";
import { connect } from "react-redux";
import { trans } from "../util/funciones";
import { changeFormContent } from "../redux/actions/app";
import axios from "axios";
import cogoToast from "cogo-toast";
import ipMaquina from "../util/ipMaquinaAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faCalendar,
  faHome
} from "@fortawesome/free-solid-svg-icons";

const mapStateToProps = state => {
  return {
    tipoUsuario: state.user.tipoUsuario
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFormContent: form => dispatch(changeFormContent(form))
  };
};

class TablaAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: []
    };
  }

  componentDidMount() {
    axios
      .get("http://" + ipMaquina + ":3001/api/procedures/getAnunciosConPerfil")
      .then(res => {
        this.setState({
          jsonAnuncios: res.data
        });
      })
      .catch(err => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
      });
  }

  botonAddAnuncio = () => {
    const { tipoUsuario, changeFormContent } = this.props;

    if (tipoUsuario === "Cliente") {
      return (
        <div
          className="d-flex justify-content-center btn btn-success"
          onClick={() => changeFormContent("formAnuncio")}
        >
          {trans("tablaAnuncios.addAnuncio")}
        </div>
      );
    }

    return null;
  };

  render() {
    const { jsonAnuncios } = this.state;
    console.log(jsonAnuncios);
    return (
      <div className="p-5">
        {this.botonAddAnuncio()}

        {jsonAnuncios.map(anuncio => {
          return (
            <div className="row card-header mt-2 mb-2">
              <div style={{ width: "300px" }}>
                <img
                  className="img-responsive"
                  src={
                    "http://" +
                    ipMaquina +
                    ":3001/api/image/" +
                    anuncio.direcFoto
                  }
                  style={{
                    minHeight: "300px",
                    maxHeight: "300px",
                    height: "auto"
                  }}
                />
                <div className="align-center text-center">
                  <FontAwesomeIcon className="text-success" icon={faHome} />{" "}
                  <span className="font-weight-bold">{anuncio.pueblo}</span>
                </div>
              </div>

              <div className="col">
                <h3>{anuncio.titulo}</h3>
                <hr />
                <h5>{anuncio.descripcion}</h5>
                <div className="row">
                  <FontAwesomeIcon
                    size={"2x"}
                    className="col text-success"
                    icon={faPhoneAlt}
                  />
                  <FontAwesomeIcon
                    size={"2x"}
                    className="col text-success"
                    icon={faCalendar}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TablaAnuncios);
