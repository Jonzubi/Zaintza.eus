import React from "react";
import { connect } from "react-redux";
import axios from "axios";
import ipMaquina from "../util/ipMaquinaAPI";
import cogoToast from "cogo-toast";
import { trans } from "../util/funciones";
import ClipLoader from "react-spinners/ClipLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Avatar from "react-avatar";

class MisAnuncios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonAnuncios: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    const { idPerfil, email, contrasena } = this.props;
    axios
      .post(`http://${ipMaquina}:3001/api/procedures/getMisAnuncios`, {
        idCliente: idPerfil,
        email,
        contrasena,
      })
      .then((res) => {
        this.setState({
          jsonAnuncios: res.data,
          isLoading: false,
        });
      })
      .catch(() => {
        cogoToast.error(
          <h5>{trans("notificaciones.servidorNoDisponible")}</h5>
        );
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    const { isLoading, jsonAnuncios } = this.state;
    return (
      <div className={isLoading ? "p-0" : "p-lg-5 p-2"}>
        {isLoading ? (
          <div
            style={{
              height: "calc(100vh - 80px)",
            }}
            className="d-flex align-items-center justify-content-center"
          >
            <ClipLoader color="#28a745" />
          </div>
        ) : jsonAnuncios.map((anuncio) => 
        <div className="d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex flex-row align-items-center justify-content-between">
                <Avatar
                    size={50}
                    name={anuncio.titulo}
                    src={
                        "http://" +
                        ipMaquina +
                        ":3001/api/image/" +
                        anuncio.direcFoto
                    }
                />
                <span className="font-weight-bold">{anuncio.titulo}</span>
            </div>
            <div className="d-flex flex-row align-items-center justify-content-between">
                <FontAwesomeIcon size={"2x"} icon={faPen} className="text-primary" />
                <FontAwesomeIcon size={"2x"} icon={faTrashAlt} className="text-danger"/>
            </div>
        </div>)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  idPerfil: state.user._id,
  email: state.user.email,
  contrasena: state.user.contrasena,
});

export default connect(mapStateToProps)(MisAnuncios);
